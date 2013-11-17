on('ready', function() {
    jrl_initiative_timer = setInterval(function() {
 
            var c = Campaign();
            var pre_turnorder = c.get('turnorder');
            if (!pre_turnorder) {
                return;
            }
            try {
            var turn_order = JSON.parse(c.get('turnorder'));
            } catch (e) {
                log(e);
                return;
            }
            if (!turn_order.length) {
                return;
            }
            var turn = turn_order.shift();
            var current_token = getObj('graphic', turn.id);  
            var radius = current_token.get('aura2_radius');
            if (!radius) {
                current_token.set({
                    'aura2_radius': 0.1,
                    'aura2_color': '#00FF00',
                    'aura2_square': false
                });
            } else {
                current_token.set({
                    'aura2_radius': 0
                });
            }
            if (turn.id != state.jrl_initiative_last_token && state.jrl_initiative_last_token) {
                 var last_token = getObj('graphic', state.jrl_initiative_last_token);
                 last_token.set({
                    'aura2_radius': 0
                });
            }
            state.jrl_initiative_last_token = turn.id;
    }, 1500);
});