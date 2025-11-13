import { InputType, Field } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class Verify2FAInput {
    @Field()
    @IsString()
    @Length(6, 6)
    token: string;
}
