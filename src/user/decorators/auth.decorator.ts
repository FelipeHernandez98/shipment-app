import { applyDecorators, UseGuards } from "@nestjs/common";
import { RoleProtected } from "./role-protected.decorator";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "src/commons/enums/roles.enum";
import { RolesGuard } from "../guards/roles.guard";



export function Auth(...roles: Roles[]){
     return applyDecorators(
        RoleProtected(...roles),
        UseGuards( AuthGuard(), RolesGuard )
     )
}