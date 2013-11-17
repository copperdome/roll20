<script type="text/javascript">
var raise_count = raise_count || {};
 
// Raise increment; generalized in case there are cases where it isn't 4
raise_count.RAISE_SIZE = 4;
// Output formatting. %1$s will be replaced with an inline roll. %2$s will be replaced by the user's target input.
// %3$s will be replaced by the number of raises resulting the from roll. change this string if you want the results
// to show up differently in chat.
raise_count.OUTPUT_FORMAT = '<div class=" rollresult clear">%1$s %2$s</div>';
 
on('chat:message', function(msg) {
    if(msg.type != 'api' || msg.content.indexOf('!rc ')) return;
    var label = 'Trait';
    var msgContent = msg.content.substring(4).split("|");
    var roll = msgContent[0];
    var modifiers = msgContent[1];
    var target = ''
    if (msgContent[2] != undefined) {
        target = msgContent[2];
    }
    if (msgContent[3] != undefined) {
        var wildMod = msgContent[3].split('-');
    } else {
        var wildMod = '';
    }
    if (target == '' || target == undefined) {
        target = 4;
    } else {
        target = eval(target);
    }
    var sendAs = 'system';
    var character = findObjs({_type: 'character', name: msg.who})[0];
    if(character) sendAs = 'character|'+character.id;
    else sendAs = 'player|'+msg.playerid;
    raise_count.initRoll(sendAs, roll+modifiers, label, target);
    
    if (wildMod[0] == 'wild') {
        if (wildMod[1] == undefined) {
           roll = "1d6!";
        } else {
            log(wildMod[1]);
            roll = '1'+wildMod[1]+'!';
        }
        label = "Wild";
        raise_count.initRoll(sendAs, roll+modifiers, label, target);
    }
    
});

on('chat:message', function(msg) {
    if(msg.type != 'api' || msg.content.indexOf('!dc ')) return;
    var msgContent = msg.content.substring(4).split("|");
    var roll = msgContent[0];
    var target = msgContent[1];
    var targetTokenId = msgContent[2];
    var label = 'Damage';
    var targetToken = getObj("graphic", targetTokenId);
    if (target == '') {
        target = 4;
    } else {
        target = eval(target);
    }

    var sendAs = 'system';
    var character = findObjs({_type: 'character', name: msg.who})[0];

    if(character) sendAs = 'character|'+character.id;
    else sendAs = 'player|'+msg.playerid;
    sendChat(sendAs, '[['+roll+']]', function(fmsg) {
        var total = fmsg[0].inlinerolls['1'].results.total;
        var resulttext = '';
        var wounds = 0;
        if (total >= target) {
            if (targetToken.get("status_half-haze") == undefined) {
                targetToken.set("status_half-haze", "true");
                resulttext = '<span style="color:#247305;"><strong>Shaken';
            } else {
                wounds = 1;
                resulttext = '<span style="color:#247305;"><strong>';
            }
        } else {
            resulttext = '<span style="color:#730505;"><strong>No Effect';
        }
        var raises = Math.floor((total - target) / raise_count.RAISE_SIZE);
        

        log("Initial Wound: "+wounds+" | Raises: "+raises);
        
        if (wounds == 0 && raises > 0) {
            wounds = raises;
            resulttext += ' with '
        } else if (wounds == 1 && raises > 1) {
            wounds = raises;
        }
        
        if (wounds == 1) {  
            resulttext += wounds+' Wound';
        } else if (wounds >= 2) { 
            resulttext += wounds+' Wounds';
        }
        resulttext += '</strong></span>';
        
        var currentWounds = targetToken.get("bar3_value");
        var maxWounds = targetToken.get("bar3_max");
        if (maxWounds == '') {
            maxWounds = -1;
        }
        var newWounds = currentWounds - wounds;
        log('Current: '+currentWounds+' Max: '+maxWounds+' New: '+newWounds);
        targetToken.set("bar3_value", newWounds);
        if (newWounds <= maxWounds) {
            targetToken.set("status_dead", true);
        }

        
        var message = '/direct '+raise_count.sprintf(raise_count.OUTPUT_FORMAT, raise_count.formatRoll(fmsg, label), resulttext);
        sendChat(sendAs, message);
    });
});

raise_count.initRoll = function(sendAs, roll, label, target) {
        sendChat(sendAs, '[['+roll+']]', function(fmsg) {
            var total = fmsg[0].inlinerolls['1'].results.total;
            var resulttext = '';
            if (total >= target) {
                resulttext = '<span style="color:#247305;"><strong>Success';
            } else {
                resulttext = '<span style="color:#730505;"><strong>Failure';
            }
            var raises = Math.floor((total - target) / raise_count.RAISE_SIZE);
            var raisetext = '';
            if (raises == 1) {
                raisetext = 'with 1 Raise';
            } else if (raises >= 2) {
                raisetext = 'with '+raises+' Raises';
            }
            resulttext = resulttext+' '+raisetext+'</strong></span>'
            
                    
            var message = '/direct '+raise_count.sprintf(raise_count.OUTPUT_FORMAT, raise_count.formatRoll(fmsg, label), resulttext);
            sendChat(sendAs, message);
        });
};
raise_count.formatRoll = function(rollObj, rollLabel) {
        var expression = rollObj[0].inlinerolls['1'].expression;
        var total = rollObj[0].inlinerolls['1'].results.total;
        var rollOut = '<div class=" formula" style="margin-bottom:3px"><strong>'+rollLabel+':</strong> '+expression+'</div>';
        var fail = crit = false;
        rollOut += '<div class=" clear"></div><div class=" formula formattedformula">';
    
        for(var i in rollObj[0].inlinerolls['1'].results.rolls)
        {
            var r = rollObj[0].inlinerolls['1'].results.rolls[i];
            
            if (r['type'] == 'R') {
                var max = r['sides'];
                rollOut += '<div class=" dicegrouping ui-sortable" data-groupindex="'+i+'">(';
                for(var k = 0; k < r['results'].length; k++)
                {
                    if (k != 0) {
                        rollOut += '</div>';
                    }
                    var value = r['results'][k]['v'];
                    crit = crit || (value == max);
                    fail = fail || (value == 1);
                    rollOut += '<div data-origindex="'+k+'" class=" diceroll d'+max+(value==max?' critsuccess':(value==1?' critfail':''))+'"><div class=" dicon">'
   
                    rollOut += '<div class=" didroll">'+value+'</div><div class=" backing"></div></div>+'; 
                }
                rollOut = rollOut.substr(0, rollOut.length -1)+'</div>)';
            } else if (r['type'] == 'M') {
                rollOut += r['expr'];
            }
            
        }
        if (rollOut.substr(rollOut.length - 1) == '+') {
            rollOut = rollOut.substr(0, rollOut.length - 1);
        }
        rollOut += '</div></div></div><div class=" clear"></div>';
        rollOut += '<div class=" rolled">'+total+'</div><strong> = </strong> ';
        return rollOut;
};
/**
 * Really really really super naive implementation of the sprintf function,
 * which will only really work for this script. I should be ashamed for qriting it.
 */
raise_count.sprintf = function(format, arg1, arg2)
{
    var out = format.replace('%1$s', arg1);
    out = out.replace('%2$s', arg2);
    return out;
};

</script>