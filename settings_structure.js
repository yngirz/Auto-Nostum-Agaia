module.exports = [
    {
        "key": "enabled",
        "name": "Enable mod",
        "type": "bool"
    },
    {
        "key": "hide_duration",
        "name": "Hide duration of nostrum buff",
        "type": "bool"
    },
    {
        "key": "hide_message",
        "name": "Hide nostrum item usage message",
        "type": "bool"
    },
    {
        "key": "keep_resurrection_invincibility",
        "name": "Do not overwrite phoenix and other resurrection buffs",
        "type": "bool"
    },
    {
        "key": "dungeon_only",
        "name": "Active only in dungeons",
        "type": "bool"
    },
    {
        "key": "civil_unrest",
        "name": "Active in Civil Unrest",
        "type": "bool"
    },
    {
        "key": "interval",
        "name": "Active nostrum check interval",
        "type": "range",
        "min": 500,
        "max": 5000
    },
    {
        "key": "selected_buff",
        "name": "Premium Slot to Use (Brave = 6, Strong = 7)",
        "type": "range",
        "min": 6,
        "max": 7
    }
];
