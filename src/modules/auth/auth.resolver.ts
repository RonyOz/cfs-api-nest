import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponseModel, TwoFactorSetupModel, MessageResponseModel } from './models/auth-response.model';
import { SignupInput } from './inputs/signup.input';
import { LoginInput } from './inputs/login.input';
import { Verify2FAInput } from './inputs/verify-2fa.input';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) { }

    @Mutation(() => AuthResponseModel, {
        description: 'Register a new user account',
    })
    async signup(
        @Args('input') signupInput: SignupInput,
    ): Promise<AuthResponseModel> {
        return this.authService.signup(signupInput);
    }

    @Mutation(() => AuthResponseModel, {
        description: 'Login with email and password. If 2FA is enabled, provide the token.',
    })
    async login(
        @Args('input') loginInput: LoginInput,
    ): Promise<AuthResponseModel> {
        return this.authService.login(loginInput);
    }

    @Mutation(() => TwoFactorSetupModel, {
        description: 'Enable 2FA for the authenticated user',
    })
    @UseGuards(GqlAuthGuard)
    async enable2FA(
        @GetUser() user: User,
    ): Promise<TwoFactorSetupModel> {
        return this.authService.enable2FA(user);
    }

    @Mutation(() => MessageResponseModel, {
        description: 'Verify and activate 2FA with the token from authenticator app',
    })
    @UseGuards(GqlAuthGuard)
    async verify2FA(
        @GetUser() user: User,
        @Args('input') verify2FAInput: Verify2FAInput,
    ): Promise<MessageResponseModel> {
        return this.authService.verify2FA(user, verify2FAInput);
    }

    @Mutation(() => MessageResponseModel, {
        description: 'Disable 2FA for the authenticated user',
    })
    @UseGuards(GqlAuthGuard)
    async disable2FA(
        @GetUser() user: User,
        @Args('input') verify2FAInput: Verify2FAInput,
    ): Promise<MessageResponseModel> {
        return this.authService.disable2FA(user, verify2FAInput);
    }
}
