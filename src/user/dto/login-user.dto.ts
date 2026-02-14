import { IsDefined, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class LoginUserDto {

    @IsString()
    @IsDefined()
    username: string;

    @IsString()
    @IsDefined()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Password must be at most 20 characters long' })
    password: string;
}