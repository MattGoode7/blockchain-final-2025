import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthorizationController {
  constructor(private readonly authService: AuthorizationService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('authorized/:address')
  authorized(@Param('address') address: string) {
    return this.authService.authorized(address);
  }

  @Post('authorize/:address')
  authorizeAccount(@Param('address') address: string) {
    return this.authService.authorizeAccount(address);
  }
} 