import { initialUsers, isUsers } from "../data/admin";
import { useLocalState } from "./storage";
export function useUsers() {
  return useLocalState("rv360:admin-users", [], isUsers);
}
