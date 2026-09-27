"""Extract only institution identifiers, names, levels and locations from MinEdec XLSX.
Usage: python scripts/extract-education-xlsx.py path/to/workbook.xlsx
Requires openpyxl. The input workbook is never modified or published.
"""
import sys,re,json,hashlib
from pathlib import Path
import openpyxl

source=Path(sys.argv[1])
sheet=openpyxl.load_workbook(source,read_only=True,data_only=True).active
schools={}; provinces={}; skipped=[]
def clean(v): return re.sub(r'\s+',' ',str(v or '')).strip()
def code(v,width): return clean(v).split('.')[0].zfill(width)
for row_number,row in enumerate(sheet.iter_rows(min_row=17,values_only=True),17):
    if not row[1]: continue
    amie=clean(row[1]).upper()
    if not re.fullmatch(r'\d{2}[A-Z]\d{5}',amie):
        skipped.append({'row':row_number,'reason':'Not an AMIE record'});continue
    pid,cid,rid=code(row[5],2),code(row[7],4),code(row[9],6)
    assert cid.startswith(pid) and rid.startswith(cid),(row_number,pid,cid,rid)
    province=provinces.setdefault(pid,dict(id=pid,name=clean(row[4]).title(),cantons={}))
    canton=province['cantons'].setdefault(cid,dict(id=cid,name=clean(row[6]).title(),parishes={}))
    canton['parishes'][rid]=dict(id=rid,name=clean(row[8]).title())
    school=dict(id=amie,name=clean(row[2]),province=pid,canton=cid,parish=rid,baccalaureate='bachillerato' in clean(row[12]).lower())
    assert amie not in schools,(row_number,amie)
    schools[amie]=school
for p in provinces.values():
    for c in p['cantons'].values(): c['parishes']=sorted(c['parishes'].values(),key=lambda p:p['name'])
    p['cantons']=sorted(p['cantons'].values(),key=lambda c:c['name'])
assert set(provinces)=={str(n).zfill(2) for n in range(1,25)}|{'90'} and len(schools)==16275
metadata=dict(source=source.name,period='2025–2026 Inicio',publisher='Ministerio de Educación, Deporte y Cultura · Registros administrativos',sheet=sheet.title,sha256=hashlib.sha256(source.read_bytes()).hexdigest(),schoolCount=len(schools),baccalaureateCount=sum(s['baccalaureate'] for s in schools.values()),skippedRows=skipped,scope='Instituciones y ubicaciones presentes en el archivo suministrado; no certifica oferta actual ni historial de graduación.')
out=Path('public/data');out.mkdir(exist_ok=True)
(out/'education-catalog.json').write_text(json.dumps(dict(metadata=metadata,provinces=sorted(provinces.values(),key=lambda p:p['name']),schools=sorted(schools.values(),key=lambda s:s['name'])),ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(json.dumps(metadata,ensure_ascii=True))
