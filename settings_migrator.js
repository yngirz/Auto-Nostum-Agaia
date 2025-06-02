"use strict"

const DefaultSettings = {
    "enabled": true,
    "hide_duration": true,
    "hide_message": true,
    "keep_resurrection_invincibility": false,
    "dungeon_only": false,
    "civil_unrest": false,
    "interval": 1000,
    "selected_buff": 6
}

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, DefaultSettings), settings);
    } else if (from_ver === null) {
        // No config file exists, use default settings
        return DefaultSettings;
    } else {
        if (from_ver + 1 < to_ver) {
            settings = MigrateSettings(from_ver, from_ver + 1, settings);
            return MigrateSettings(from_ver + 1, to_ver, settings);
        }

        switch (to_ver) {
            case 2:
                settings.dungeon_only = false;
                break;
            case 3:
                settings.civil_unrest = false;
                break;
            case 4:
                if (settings.selected_buff === undefined) {
                    settings.selected_buff = 6;
                }
                break;
        }

        return settings;
    }
}
