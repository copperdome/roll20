var combat = combat || {};
 
// Raise increment; generalized in case there are cases where it isn't 4
combat.CURRENT_ROUND = 0;

on('chat:message', function(msg) {
    if(msg.type == 'api' && msg.content.indexOf('!next-turn') !== -1) {
        var turnorder;
        if(Campaign().get("turnorder") == "") turnorder = []; //NOTE: We check to make sure that the turnorder isn't just an empty string first. If it is treat it like an empty array.
        else turnorder = JSON.parse(Campaign().get("turnorder"));
        var item = [];
        item = turnorder.shift();
        //Add a new custom entry to the end of the turn order.
        turnorder.push({
            id: item['id'],
            pr: '',
            custom: item['custom']
        });
        Campaign().set("turnorder", JSON.stringify(turnorder));
        // combat.CURRENT_ROUND = combat.CURRENT_ROUND + 1;
        // sendChat('system', '/me Combat Round: '+combat.CURRENT_ROUND);
    }
});
    
on('chat:message', function(msg) {
    if(msg.type == 'api' && msg.content.indexOf('!hold-turn') !== -1) {
        var turnorder;
        if(Campaign().get("turnorder") == "") turnorder = []; //NOTE: We check to make sure that the turnorder isn't just an empty string first. If it is treat it like an empty array.
        else turnorder = JSON.parse(Campaign().get("turnorder"));
        var item = [];
        item = turnorder.shift();
        item2 = turnorder.shift();
        turnorder.unshift({
            id: item['id'],
            pr: item['pr']+'-Hold',
            custom: item['custom']
        });
        turnorder.unshift({
            id: item2['id'],
            pr: item2['pr'],
            custom: item2['custom']
        });
        Campaign().set("turnorder", JSON.stringify(turnorder));
    }
});