/**
 * @name backgroundImage
 * @author KiNa
 * @authorId 252100217959219200
 * @version 1.0
 * @description Pick A random background Image from a list. Important!! This plugin only works with better discord theme "NotAnotherAnimeTheme" for now
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/backgroundImage/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/backgroundImage.plugin.js
 */

/*//===
TODO
the plugin only works with theme. Check if user using a theme?
\*/
module.exports = (_ => {
    const config = {
        "info": {
            "name": "backgroundImage",
            "author": "KiNa",
            "version": "1.0",
            "description": "Pick A random background Image from a list. Important!! This plugin only works with better discord theme 'NotAnotherAnimeTheme' for now"
        },
        "changeLog": {}
    };

    return (window.Lightcord && !Node.prototype.isPrototypeOf(window.Lightcord) || window.LightCord && !Node.prototype.isPrototypeOf(window.LightCord) || window.Astra && !Node.prototype.isPrototypeOf(window.Astra)) ? class {
        getName() { return config.info.name; }
        getAuthor() { return config.info.author; }
        getVersion() { return config.info.version; }
        getDescription() { return "Do not use LightCord!"; }
        load() { BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)"); }
        start() {}
        stop() {}
    } : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
        getName() { return config.info.name; }
        getAuthor() { return config.info.author; }
        getVersion() { return config.info.version; }
        getDescription() { return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`; }

        downloadLibrary() {
            require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
                if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", { type: "success" }));
                else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
            });
        }

        load() {
            if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, { pluginQueue: [] });
            if (!window.BDFDB_Global.downloadModal) {
                window.BDFDB_Global.downloadModal = true;
                BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onCancel: _ => { delete window.BDFDB_Global.downloadModal; },
                    onConfirm: _ => {
                        delete window.BDFDB_Global.downloadModal;
                        this.downloadLibrary();
                    }
                });
            }
            if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
        }
        start() { this.load(); }
        stop() {}
        getSettingsPanel() {
            let template = document.createElement("template");
            template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
            template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
            return template.content.firstElementChild;
        }
    } : (([Plugin, BDFDB]) => {
        var settings = {}
        var urlsList = {}
        return class backgroundImage extends Plugin {
            onLoad() {
                this.defaults = {
                    general: {
                        changealart: {
                            value: false,
                            description: "Show change image alart"
                        },
                    },
                }
            };
            onStart() {
                this.changeimage();
                this.forceUpdateAll();
            }
            onStop() {
                this.cleanup();
                this.forceUpdateAll();
            }
            changeimage() {
                let appMount = document.querySelector(BDFDB.dotCN.appmount);

                let List = []
                const urlList = BDFDB.DataUtils.load(this, "urlsList");
                const propertyNames = Object.values(urlList)
                let i = 0;
                for (const v of propertyNames) {
                    if (v.enabled) {
                        List[i] = v.value
                        i++
                    }
                };
                if (!List || List.length == 0) return
                let random = List[Math.floor(Math.random() * List.length)];
                try {
                    appMount.style.setProperty("background-image", "url(" + random + ")");
                } catch (err) { BdApi.alert("Error", "Could not"); }
                if (this.settings.general.changealart) BdApi.alert("Background image", `Your Image: ${random}`);
            }
            cleanup() {
                try {
                    document.querySelector(BDFDB.dotCN.appmount).style.setProperty("background-image", "var(--theme-background-image)");
                } catch (err) { BdApi.alert("Error", "Could not"); }
            }
            getSettingsPanel(collapseStates = {}) {
                let settingsPanel;

                return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
                    collapseStates: collapseStates,
                    children: _ => {
                        let settingsItems = [];

                        settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
                            title: "Settings",
                            collapseStates: collapseStates,
                            children: Object.keys(this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
                                type: "Switch",
                                plugin: this,
                                keys: ["general", key],
                                label: this.defaults.general[key].description,
                                value: this.settings.general[key]
                            }))
                        }));
                        settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
                            title: "Image List",
                            collapseStates: collapseStates,
                            children: [
                                BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
                                    className: BDFDB.disCN.marginbottom4,
                                    tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H3,
                                    children: "Add additional image links: "
                                }),
                                BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
                                    className: BDFDB.disCN.marginbottom8,
                                    align: BDFDB.LibraryComponents.Flex.Align.END,
                                    children: [
                                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
                                            children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
                                                title: "Name:",
                                                children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
                                                    className: "input-newname input-name",
                                                    value: "",
                                                    placeholder: "Name"
                                                })
                                            })
                                        }),
                                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
                                            children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
                                                title: "Link:",
                                                children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
                                                    className: "input-newlink input-link",
                                                    value: "",
                                                    placeholder: "Link"
                                                })
                                            })
                                        }),
                                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
                                            style: { marginBottom: 1 },
                                            onClick: _ => {
                                                let name = settingsPanel.props._node.querySelector(".input-name " + BDFDB.dotCN.input).value.trim();
                                                let url = settingsPanel.props._node.querySelector(".input-link " + BDFDB.dotCN.input).value.trim();
                                                if (!name || name.length == 0) return BDFDB.NotificationUtils.toast("Fill out all fields to add a new Image.", { type: "danger" });
                                                else if (urlsList[name]) return BDFDB.NotificationUtils.toast("the choosen Name already exists, please choose another Name", { type: "danger" });
                                                else if (!validURL(url.toString()) && (url.substring(url.length - 3) !== 'png' || url.substring(url.length - 3) !== 'jpg')) return BDFDB.NotificationUtils.toast("The choosen link is not a valid url, Any images you use MUST end with .jpg or .png", { type: "danger" }); //todo
                                                else {
                                                    urlsList[name] = { enabled: true, value: url.toString() };
                                                    BDFDB.DataUtils.save(urlsList, this, "urlsList");
                                                    BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
                                                }
                                            },
                                            children: BDFDB.LanguageUtils.LanguageStrings.ADD
                                        })
                                    ]
                                })
                            ].concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
                                title: "Your own image list:",
                                dividerTop: true,
                                children: Object.keys(urlsList).map(name => {
                                    let ImageName = name;
                                    return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
                                        horizontal: true,
                                        children: [
                                            BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
                                                grow: 0,
                                                basis: "180px",
                                                children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
                                                    value: ImageName,
                                                    placeholder: ImageName,
                                                    size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
                                                    maxLength: 100000000000000000000,
                                                    onChange: value => {
                                                        urlsList[value] = urlsList[ImageName];
                                                        delete urlsList[ImageName];
                                                        ImageName = value;
                                                        BDFDB.DataUtils.save(urlsList, this, "urlsList");
                                                    }
                                                })
                                            }),
                                            BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
                                                children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
                                                    value: urlsList[name].value,
                                                    placeholder: urlsList[name].value,
                                                    size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
                                                    maxLength: 100000000000000000000,
                                                    onChange: tvalue => {
                                                        urlsList[name].value = tvalue;
                                                        BDFDB.DataUtils.save(urlsList, this, "urlsList");
                                                    }
                                                })
                                            }),
                                            BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
                                                children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
                                                    value: urlsList[name].enabled,
                                                    size: BDFDB.LibraryComponents.Switch.Sizes.MINI,
                                                    onChange: value => {
                                                        urlsList[name].enabled = value;
                                                        BDFDB.DataUtils.save(urlsList, this, "urlsList");
                                                    }
                                                })
                                            })
                                        ],
                                        onRemove: _ => {
                                            delete urlsList[ImageName];
                                            BDFDB.DataUtils.save(urlsList, this, "urlsList");
                                            BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel);
                                        }
                                    });
                                })
                            })).filter(n => n)
                        }));
                        return settingsItems;
                    }
                });
            }

            onSettingsClosed(e) {
                if (this.SettingsUpdated) {
                    delete this.SettingsUpdated;
                    this.forceUpdateAll();
                }
                this.forceUpdateAll();
                this.changeimage();
            }

            forceUpdateAll() {
                const loadedList = BDFDB.DataUtils.load(this, "urlsList");
                urlsList = Object.assign(!loadedList ? { "": { enabled: true, value: loadedList.value } } : {}, loadedList);
                settings = BDFDB.DataUtils.get(this, "settings");
                BDFDB.PatchUtils.forceAllUpdates(this);
            }
        }
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();


function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}