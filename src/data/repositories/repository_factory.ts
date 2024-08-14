import type { Repository } from "./repository";
import { WebRepository } from "./web_repository";

export const webRepository : Repository = new WebRepository("http://localhost:5000")