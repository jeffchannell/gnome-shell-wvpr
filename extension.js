'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;

const Config = imports.misc.config;
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

var NprbuttonIndicator = class NprbuttonIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, `${Me.metadata.name} Indicator`, true);

        // add icons
        let play_icon = new Gio.ThemedIcon({name: `media-playback-start-symbolic`});
        let stop_icon = new Gio.ThemedIcon({name: `media-playback-pause-symbolic`});
        let icon = new St.Icon({
            gicon: stop_icon,
            style_class: `system-status-icon`
        });
        this.actor.add_child(icon);

        // add toggle function to button actor
        this.actor._toggle_npr = function (active) {
            if (active) {
                this.add_style_pseudo_class(`active`);
                icon.gicon = stop_icon;
            } else {
                this.remove_style_pseudo_class(`active`);
                icon.gicon = play_icon;
            }
        };
        this.actor._toggle_npr(`stopped` !== run(`player.sh status`));
        
        // override toggle
        this.menu.toggle = function() {
            this.actor._toggle_npr(`stopped` !== run(`player.sh`));
        };
    }
}

if (SHELL_MINOR > 30) {
    NprbuttonIndicator = GObject.registerClass(
        {GTypeName: `NprbuttonIndicator`},
        NprbuttonIndicator
    );
}

var indicator = null;

function init()
{
}

function enable()
{
    if (!GLib.spawn_command_line_sync(`which cvlc`)[1].toString().length) {
        logError(`Cannot find "cvlc", exiting.`);
        return;
    }
    indicator = new NprbuttonIndicator();
    Main.panel.addToStatusArea(`${Me.metadata.name} Indicator`, indicator);
}

function disable()
{
    run(`player.sh stop`);
    if (indicator) {
        indicator.destroy();
        indicator = null;
    }
}

function run(cmd)
{
    return GLib.spawn_command_line_sync(Me.dir.get_path() + `/` + cmd)[1].toString();
}