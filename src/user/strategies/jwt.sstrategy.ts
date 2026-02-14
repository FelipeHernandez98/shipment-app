
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { JwtPayload } from "src/commons/interfaces/jwt-payload.interface";
import { StatesEnum } from "src/commons/enums/states.enum";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository( User )
        private readonly userRespository: Repository<User>,

        configService: ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    async validate( payload: JwtPayload ): Promise<User> {

        const { id } = payload;
        const user = await this.userRespository.findOneBy({ id })

        if( !user )
            throw new UnauthorizedException('Token not valid')
        if ( user.stateId === StatesEnum.INACTIVE)
            throw new UnauthorizedException('User is inactive, talk with an admin')

        return user;
    }

}