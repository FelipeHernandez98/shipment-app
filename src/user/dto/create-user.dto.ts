import { IsDefined, IsString, Matches, Max, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString()
    @MaxLength(30)
    name: string;

    @IsString()
    @MaxLength(30)
    lastname: string;

    @IsString()
    @MaxLength(30)
    username: string;

    @IsString()
    @MaxLength(15)
    phoneNumber: string;

    @IsString()
    @IsDefined()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Password must be at most 20 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { 
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    })
    password: string;

}
