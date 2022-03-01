import { ICommand } from "../interfaces/command"
import { notify } from "./notify"
import { ping } from "./ping"
import { reset } from "./reset"
import { resin } from "./resin"
import { assemble } from "./simps"

export const CommandList: ICommand[] = [ping, assemble, reset, resin, notify]
