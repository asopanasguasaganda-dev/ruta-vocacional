import { db, document, fail, put } from './store';

export function renameGroup(user: any, previous: unknown, next: unknown) {
  if (user.role !== 'admin' || !user.institutionId) fail('Solo administración puede modificar grupos.', 403);
  if (typeof previous !== 'string' || typeof next !== 'string' || next.trim().length < 2 || next.trim().length > 100) fail('Escribe un nombre de grupo de 2 a 100 caracteres.');
  const name = next.trim(), owner = 'institution:' + user.institutionId;
  db.exec('BEGIN IMMEDIATE');
  try {
    const custom = document(owner, 'rv360:admin-groups', []) as string[];
    const assigned = db.prepare('SELECT DISTINCT groupName FROM users WHERE institutionId=?').all(user.institutionId) as {groupName: string}[];
    const groups = [...new Set([...custom, ...assigned.map(row => row.groupName)])];
    if (!groups.includes(previous)) fail('El grupo cambió o ya no existe. Recarga la página.', 409);
    if (groups.some(group => group !== previous && group.toLocaleLowerCase() === name.toLocaleLowerCase())) fail('Ya existe un grupo con este nombre.', 409);
    db.prepare('UPDATE users SET groupName=? WHERE institutionId=? AND groupName=?').run(name, user.institutionId, previous);
    put(owner, 'rv360:admin-groups', [...new Set([...custom.filter(group => group !== previous), name])]);
    // Only the assignment label changes; questions, rules and immutable deliveries remain intact.
    const tests = document(owner, 'rv360:custom-tests', []) as any[];
    if (tests.some(test => test.group === previous)) put(owner, 'rv360:custom-tests', tests.map(test => test.group === previous ? {...test, group: name} : test));
    put(owner, 'rv360:admin-users', document(owner, 'rv360:admin-users', []));
    put(owner, 'rv360:audit', [{name: user.name, action: 'Renombrar grupo', entity: previous + ' → ' + name, created_at: new Date().toISOString()}, ...document(owner, 'rv360:audit', [])].slice(0, 1000));
    db.exec('COMMIT');
    return {ok: true};
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
