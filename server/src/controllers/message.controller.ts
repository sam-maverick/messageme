import { Controller, Post, Req } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { AppService } from '../app.service';
import UsersModel from '../middleware/database/schemas/user';
import MessagesModel from '../middleware/database/schemas/message';
<<<<<<< HEAD
=======
import { PARAM_LOGGING_LEVEL } from '../parameters';
>>>>>>> f2d05ec (Initial commit)
import { LogMe } from '../serverLibrary';


@Controller('messages')
export class MessageController {
    constructor(private readonly appService: AppService) {}

    @Post('/sendMessage')
    async sendMessage(@Req() req) {

<<<<<<< HEAD
        LogMe(1, 'Controller: messages/sendMessage');    
=======
        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: messages/sendMessage');  }    
>>>>>>> f2d05ec (Initial commit)

        const cookie: string = req.body.cookie;

        const userSender = await UsersModel.findOne({'cookie': cookie });

        if(userSender) {

            const newMessageDocument = {
                sender: userSender.username,
                recipient: req.body.recipient,
                message : req.body.message,
            };

            const message = await MessagesModel.create(newMessageDocument);
            
            if(message) {
                return {
                    isSuccessful: true,
                    resultMessage: 'Message queued successfully.',
                };
            } else {
                return {
                    isSuccessful: false,
                    resultMessage: 'There has been an error.',
                };
            }
        } else {

            return {
                isSuccessful: false,
                resultMessage: 'Cookie not found on the server.',     
            };
        }

    }

    @Post('/receiveMessage')
    async receiveMessage(@Req() req) {

<<<<<<< HEAD
        LogMe(1, 'Controller: messages/receiveMessage');    
=======
        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: messages/receiveMessage');  }    
>>>>>>> f2d05ec (Initial commit)
    
        const cookie: string = req.body.cookie;

        const userRecipient = await UsersModel.findOne({'cookie': cookie });
<<<<<<< HEAD
        LogMe(1, 'Controller: messages/receiveMessage: cookie checked');    
=======
        if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: messages/receiveMessage: cookie checked');  }    
>>>>>>> f2d05ec (Initial commit)

        if(userRecipient) {

            const messageInQueue = await MessagesModel.findOne({'recipient': userRecipient.username });
            // ToDo: Order messages by date to make sure they are delivered orderly
            // ToDo: Make sure the recipient has received the result of this query before deleting the message

<<<<<<< HEAD
            LogMe(1, 'Controller: messages/receiveMessage: message retrieval from DB done');    
=======
            if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: messages/receiveMessage: message retrieval from DB done');  }    
>>>>>>> f2d05ec (Initial commit)

            if(messageInQueue) {

                const deletemessageInQueue = await MessagesModel.deleteOne({'_id': messageInQueue._id });
<<<<<<< HEAD
                LogMe(1, 'Controller: messages/receiveMessage: message deletion done');    
=======
                if (PARAM_LOGGING_LEVEL>=1) {  LogMe('Controller: messages/receiveMessage: message deletion done');  }    
>>>>>>> f2d05ec (Initial commit)

                return {
                    isSuccessful: true,
                    resultMessage: 'Message in queue found.',
                    wasNewMessageFound : true,
                    messageContainer: messageInQueue,
                };
            } else {
                return {
                    isSuccessful: true,
                    wasNewMessageFound : false,
                    resultMessage: 'There are no messages in queue.',
                };
            }
        } else {

            return {
                isSuccessful: false,
                resultMessage: 'Cookie not found on the server.',     
            };
        }

    }


}
