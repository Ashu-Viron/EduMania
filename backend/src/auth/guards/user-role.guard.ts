import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserRoleGuard implements CanActivate {
    constructor(private allowedRole: UserRole) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || user.role !== this.allowedRole) {
            throw new UnauthorizedException('You do not have the required role to access this resource.');
        }

        return true;
    }
}