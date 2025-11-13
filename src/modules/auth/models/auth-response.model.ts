import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthResponseModel {
    @Field()
    message: string;

    @Field()
    token: string;
}

@ObjectType()
export class TwoFactorSetupModel {
    @Field()
    secret: string;

    @Field()
    qrCode: string;
}

@ObjectType()
export class MessageResponseModel {
    @Field()
    message: string;
}
