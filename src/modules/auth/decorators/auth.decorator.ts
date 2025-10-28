import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { AuthGuard } from '@nestjs/passport';

export function Auth(...roles: string[]) {
  const decorators = [
    UseGuards(AuthGuard(), RolesGuard),
    ApiBearerAuth(),
  ];

  if (roles.length > 0) {
    decorators.push(Roles(...roles));
  }

  return applyDecorators(...decorators);
}