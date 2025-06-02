const BUFFS_NOSTRUM = [4030, 4031, 4032, 4033],
      BUFFS_NOCTENIUM = [5010009],
      BUFFS_NOCTENIUM_STRONGER = [920, 921, 922],
      BUFF_RES_INVINCIBLE = 1134,
      BUFF_PHOENIX = 6007;

const SettingsUI = require('tera-mod-ui').Settings;

function ClientMod(mod) {}

function NetworkMod(mod) {
    mod.game.initialize(['me', 'me.abnormalities', 'contract']);

    function abnormalityDuration(id) {
        const abnormality = mod.game.me.abnormalities[id];
        return abnormality ? abnormality.remaining : 0n;
    }

    let premiumSlots = [];

    mod.hook('S_PREMIUM_SLOT_DATALIST', 2, event => {
        premiumSlots = [];

        event.sets.forEach(set => {
            set.inventory.filter(entry => entry.type === 1).forEach(entry => {
                premiumSlots.push({
                    set: set.id,
                    slot: entry.slot,
                    type: entry.type,
                    id: entry.id
                });
            });
        });
    });

    mod.hook('S_PREMIUM_SLOT_OFF', 'event', () => {
        premiumSlots = [];
    });

    function getSelectedPremiumItem() {
        const slotIndex = mod.settings.selected_buff - 1;
        return premiumSlots.find(entry => entry.slot === slotIndex);
    }

    function useBuffSlotIfNeeded() {
        if (
            BUFFS_NOSTRUM.some(buff => abnormalityDuration(buff) > BigInt(60 * 1000)) ||
            (mod.settings.keep_resurrection_invincibility && abnormalityDuration(BUFF_RES_INVINCIBLE) > 0n) ||
            abnormalityDuration(BUFF_PHOENIX) > 0n
        ) return;

        const item = getSelectedPremiumItem();
        if (!item) return;

        mod.send('C_USE_PREMIUM_SLOT', 1, {
            set: item.set,
            slot: item.slot,
            type: item.type,
            id: item.id
        });
    }

    function useNoctenium() {
        if (BUFFS_NOCTENIUM_STRONGER.some(buff => abnormalityDuration(buff) > 0n)) return;
        if (BUFFS_NOCTENIUM.some(buff => abnormalityDuration(buff) > BigInt(60 * 1000))) return;

        const slotIndex = 7;
        const item = premiumSlots.find(entry => entry.slot === slotIndex);
        if (!item) return;

        mod.send('C_USE_PREMIUM_SLOT', 1, {
            set: item.set,
            slot: item.slot,
            type: item.type,
            id: item.id
        });
    }

    function usePremiumItems() {
        if (!mod.settings.enabled || (mod.settings.dungeon_only && !mod.game.me.inDungeon) || (!mod.settings.civil_unrest && mod.game.me.inCivilUnrest))
            return;

        if (!mod.game.isIngame || mod.game.isInLoadingScreen || !mod.game.me.alive || mod.game.me.mounted || mod.game.me.inBattleground || mod.game.contract.active)
            return;

        useBuffSlotIfNeeded();
        useNoctenium();
    }

    let interval = null;

    function start() {
        stop();
        interval = mod.setInterval(usePremiumItems, mod.settings.interval);
    }

    function stop() {
        if (interval) {
            mod.clearInterval(interval);
            interval = null;
        }
    }

    mod.game.on('enter_game', () => start());
    mod.game.on('leave_game', () => {
        stop();
        premiumSlots = [];
    });

    mod.game.me.on('resurrect', () => start());

    let ui = null;

    if (global.TeraProxy.GUIMode) {
        ui = new SettingsUI(mod, require('./settings_structure'), mod.settings, { height: 250 });

        ui.on('update', settings => {
            mod.settings = settings;
            if (interval) {
                stop();
                start();
            }
        });

        this.destructor = () => {
            if (ui) {
                ui.close();
                ui = null;
            }
        };
    }

    mod.command.add('ten', {
        $default() {
            if (ui) {
                ui.show();
            } else {
                mod.settings.enabled = !mod.settings.enabled;
                mod.command.message(mod.settings.enabled ? 'enabled' : 'disabled');
            }
        },
        on() {
            mod.settings.enabled = true;
            mod.command.message('enabled');
        },
        off() {
            mod.settings.enabled = false;
            mod.command.message('disabled');
        }
    });
}

module.exports = { ClientMod, NetworkMod };
