import Log from '../utils/Log';

import { CommandContext } from 'slash-create'
import { Request } from './Request'
import { MessageReactionRequest } from '../types/discord/MessageReactionRequest';
import { Activities } from '../constants/activities';
import DiscordUtils from '../utils/DiscordUtils';

export class PublishRequest extends Request {
    bountyId: string;
    
    constructor(args: {
        commandContext: CommandContext, 
        messageReactionRequest: MessageReactionRequest,
        directRequest: {
            bountyId: string,
            guildId: string,
            userId: string,
            activity: string,
            bot: boolean 
        }
    }) {
        if (args.commandContext) {
            let commandContext: CommandContext = args.commandContext;
            if (commandContext.subcommands[0] !== Activities.publish) {
                throw new Error('PublishRequest attempted created for non Publish activity.');
            }
            super(commandContext.subcommands[0], commandContext.guildID, args.commandContext.user.id, args.commandContext.user.bot);
            this.bountyId = commandContext.options.publish['bounty-id'];
        }
        else if (args.messageReactionRequest) {
            let messageReactionRequest: MessageReactionRequest = args.messageReactionRequest;
            super(Activities.publish, messageReactionRequest.message.guildId, messageReactionRequest.user.id, messageReactionRequest.user.bot);
            this.bountyId = DiscordUtils.getBountyIdFromEmbedMessage(messageReactionRequest.message);
        }
        else if (args.directRequest) {
            super(args.directRequest.activity, args.directRequest.guildId, args.directRequest.userId, args.directRequest.bot);
            this.bountyId = args.directRequest.bountyId;

        }

        Log.debug(`Created PublishRequest`);
    }
}