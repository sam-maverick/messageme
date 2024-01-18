import { Controller, Post, Req } from '@nestjs/common';

import { AppService } from '../app.service';
import UsersModel from '../middleware/database/schemas/user';
import MessagesModel from '../middleware/database/schemas/message';
import { PARAM_LOGGING_LEVEL } from '../parameters';
import { LogMe } from '../serverLibrary';


@Controller('administration')
export class AdministrationController {
    constructor(private readonly appService: AppService) {}

    @Post('/resetFactoryDB')
    async resetDB(@Req() req) {
    
        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: administration/resetFactoryDB');  }    

        const deletedusers = await UsersModel.deleteMany({});
        const deletedmessages = await MessagesModel.deleteMany({});

        return {isSuccessful: true};

    }
  

}
