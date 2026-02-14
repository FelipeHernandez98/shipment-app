import { IsEmail, IsString } from "class-validator";

export class CreateClientDto {

    @IsString()
    name: string;

    @IsString()
    lastname: string;

    @IsString()
    documentType: string;

    @IsString()
    documentNumber: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    address: string;

    @IsString()
    city: string;

    @IsEmail()
    email: string;


}
