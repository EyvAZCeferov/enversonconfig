/********************
     * Global Değişkenler
     ********************/
var statuses = {
    searching: false,
    loading: true,
    combo_start: false,
    connecting: false,
    ended: false,
    error: false
};

var properties = {
    allusers: null,
    user: null,
    authenticated_ip: null,
    languages: null,
    alllanguages: null,
    combo_settings: null,
    current_language_files: null,
    current_locale: "en"
};

var thinking_progress = null;

var form = {
    language: "en",
    tips: null,
    alltips: [],
    currenttips: null
};

var validations = {
    tipsValidationError: false
};

var room = null;


function getStaticTranslation(key) {
    try {
        if (key === "start_combo_button") {
            return properties.current_language_files.combo.start_combo_button || key;
        } else if (key === "create_room_button") {
            return properties.current_language_files.combo.create_room_button || key;
        } else if (key === "combo_live_header") {
            return properties.current_language_files.combo.combo_live_header || key;
        } else if (key === "combo_live_description") {
            return properties.current_language_files.combo.combo_live_description || key;
        } else {
            return properties.current_language_files[key] || key;
        }
    } catch (err) {
        return key;
    }
}

function getTitleInArray(key, array) {
    var item = array[key];
    return item ? item : key;
}

function getNotConnectTexts(key) {
    var now = new Date();
    var openTimeParts = properties.combo_settings.open_time_hours.split(":");
    var openHours = parseInt(openTimeParts[0]);
    var openMinutes = parseInt(openTimeParts[1]);
    var openTime = new Date();
    openTime.setHours(openHours);
    openTime.setMinutes(openMinutes);
    openTime.setSeconds(0);

    if (key === "header") {
        if (properties.combo_settings.status === true) {
            if (now > openTime) {
                statuses.combo_start = true;
                return getStaticTranslation("combo_live_header");
            } else {
                return properties.combo_settings.open_time_title;
            }
        } else {
            return properties.combo_settings.open_time_title;
        }
    } else if (key === "description") {
        if (properties.combo_settings.status === true) {
            if (now > openTime) {
                statuses.combo_start = true;
                return getStaticTranslation("combo_live_description");
            } else {
                return properties.combo_settings.open_time_description;
            }
        } else {
            return properties.combo_settings.open_time_description;
        }
    } else if (key === "button") {
        // Butonun devre dışı bırakılma durumunu (disabled) belirlemek için
        if (properties.combo_settings.status === true) {
            if (now > openTime) {
                statuses.combo_start = true;
                return false; // aktif (enabled)
            } else {
                return false;
            }
        } else {
            return true; // devre dışı (disabled)
        }
    }
}

function updateUI() {
    var statusSection = document.getElementById("status-section");
    if (statusSection) {
        var notStarted = document.getElementById("not-started");

        // Eğer arama, bağlantı veya sonuç durumları aktifse status-section gösterilsin
        if (statuses.searching || statuses.connecting || statuses.ended) {
            statusSection.style.display = "block";
            notStarted.style.display = "none";
        } else {
            statusSection.style.display = "none";
            notStarted.style.display = "block";
        }

        // Başlık ve açıklamayı güncelle
        document.getElementById("combo-header").textContent = getNotConnectTexts("header");
        document.getElementById("combo-description").innerHTML = getNotConnectTexts("description");

        // Buton metinlerini ayarla
        document.getElementById("start-combo").textContent = getStaticTranslation("start_combo_button");
        document.getElementById("create-link").textContent = getStaticTranslation("create_room_button");

        // Butonların aktiflik durumunu ayarla
        var buttonDisabled = getNotConnectTexts("button");
        document.getElementById("start-combo").disabled = buttonDisabled;
        document.getElementById("create-link").disabled = buttonDisabled;

        // Arama ve sonuç bölümlerinin görünürlüğü
        document.getElementById("searching-status").style.display = statuses.searching ? "block" : "none";
        document.getElementById("ended-status").style.display = statuses.ended ? "block" : "none";
    }
}

function languageselect() {
    showLoader();
    var data = {
        language: form.language
    };
    var tipsSelect = document.getElementById("tips-select");
    if (tipsSelect) {
        sendAjaxRequestOLD("https://enverson.com/az/combo/get_topics_from_language", "post", data, function (e, t) {
            hideLoader();
            var n = JSON.parse(t);
            form.alltips = n.data;
            form.currenttips = n.currenttips;

            tipsSelect.innerHTML = "";
            var option = document.createElement("option");
            option.value = null;
            option.textContent = "Select a level";
            tipsSelect.appendChild(option);
            n.data.forEach(function (tips) {
                var option = document.createElement("option");
                option.value = tips.id;
                option.textContent = tips.name.en_name;
                tipsSelect.appendChild(option);
            });
            if (n.currenttips != null) {
                tipsSelect.value = n.currenttips.id;
                form.tips = n.currenttips.id;
            }
        });
    }
}

function startCombo() {
    validations.tipsValidationError = false;
    document.getElementById("tips-error").style.display = "none";
    if (form.language != null && form.tips != null) {
        var data = {
            language: form.language,
            tips_id: form.tips,
            auth_id: properties.user.id,
            type: "combo"
        };
        sendAjaxRequestOLD("https://enverson.com/az/combo/create_room", "post", data, function (e, t) {
            hideLoader();
            var n = JSON.parse(t);
            room = n.data;
            statuses.searching = true;
            updateUI();
            var sidebar_hide = document.getElementById("sidebar-hide");
            if (sidebar_hide) {
                sidebar_hide.click();
            }
        });
    } else {
        if (form.tips == null) {
            validations.tipsValidationError = true;
            document.getElementById("tips-error").style.display = "block";
        }
    }
}

function createLink() {
    var codeInput = document.getElementById("code");
    if (form.language != null && form.tips != null) {
        var token = document.getElementById("token");
        if (token != null) {
            var data = {
                language: form.language,
                tips_id: form.tips,
                auth_id: token.value,
                type: "create_link",
                code: codeInput ? codeInput.value : null
            };
            sendAjaxRequestOLD("https://enverson.com/az/combo/create_room", "post", data, function (e, t) {
                hideLoader();
                var n = JSON.parse(t);
                room = n.data;
                statuses.searching = true;
                var sidebar_hide = document.getElementById("sidebar-hide");
                if (sidebar_hide) {
                    sidebar_hide.click();
                }
                console.log(room);
                window.location.href = "/room/" + room.code
            });
        }
    } else {
        if (form.tips == null) {
            validations.tipsValidationError = true;
            document.getElementById("tips-error").style.display = "block";
        }
    }
}

function setBladeInputs() {
    var allusersElem = document.getElementById("allusers");
    if (allusersElem) properties.allusers = JSON.parse(allusersElem.value);

    var userElem = document.getElementById("user");
    if (userElem) properties.user = JSON.parse(userElem.value);

    var authenticatedIpElem = document.getElementById("authenticated_ip");
    if (authenticatedIpElem) properties.authenticated_ip = authenticatedIpElem.value;

    var languagesElem = document.getElementById("languages");
    if (languagesElem) properties.languages = JSON.parse(languagesElem.value);

    var allLanguagesElem = document.getElementById("alllanguages");
    if (allLanguagesElem) properties.alllanguages = JSON.parse(allLanguagesElem.value);

    var comboSettingsElem = document.getElementById("combo_settings");
    if (comboSettingsElem) properties.combo_settings = JSON.parse(comboSettingsElem.value);

    var currentLanguageFilesElem = document.getElementById("current_language_files");
    if (currentLanguageFilesElem) properties.current_language_files = JSON.parse(currentLanguageFilesElem.value);

    var currentLocaleElem = document.getElementById("current_locale");
    if (currentLocaleElem) properties.current_locale = currentLocaleElem.value;

    statuses.loading = false;

    // Dillerin seçileceği alanı dolduralım
    if (document.getElementById("language-select")) {
        var languageSelect = document.getElementById("language-select");
        if (properties.languages) {
            languageSelect.innerHTML = "";
            properties.languages.forEach(function (lang) {
                var option = document.createElement("option");
                option.value = lang;
                option.textContent = getTitleInArray(lang, properties.alllanguages);
                languageSelect.appendChild(option);
            });
            form.language = languageSelect.value;
        }
    }
}

function time_control() {
    setInterval(function () {
        if (!statuses.combo_start) {
            updateUI();
        }
    }, 1500);
}

function stop_and_get_result() {
    statuses.searching = false;
    statuses.combo_start = false;
    statuses.connecting = false;
    statuses.ended = true;
    statuses.error = false;
    var data = {
        id: properties.user.id
    };
    sendAjaxRequestOLD("/" + properties.current_locale + "/combo/get_analyze_result", "post", data, function (e, t) {
        hideLoader();
        var n = JSON.parse(t);
        thinking_progress = n.data;
        console.log("Analyze result:", n.data);
        var thinkingArea = document.getElementById("thinking-area");
        if (thinkingArea) {
            thinkingArea.textContent = "Thinking progress: " + JSON.stringify(thinking_progress);
        }
    });
    console.log("stop_and_get_result called");
    updateUI();
}

document.addEventListener("DOMContentLoaded", function () {
    // Blade verilerini oku
    setBladeInputs();
    // Zaman kontrolünü başlat
    time_control();
    // Dil seçimi değiştiğinde
    if (document.getElementById("language-select")) {
        document.getElementById("language-select").addEventListener("change", function () {
            form.language = this.value;
            languageselect();
        });
    }
    // Seviye (tips) seçimi değiştiğinde
    if (document.getElementById("tips-select")) {
        document.getElementById("tips-select").addEventListener("change", function () {
            form.tips = this.value;
        });
    }
    // Buton tıklama olayları
    if (document.getElementById("start-combo"))
        document.getElementById("start-combo").addEventListener("click", startCombo);

    if (document.getElementById("create-link"))
        document.getElementById("create-link").addEventListener("click", createLink);

    // İlk UI güncellemesini yap
    updateUI();
    // Sayfa yüklendiğinde konuların (tips) yüklenmesi için
    languageselect();
});

document.addEventListener("DOMContentLoaded", function () {
    const containerLotties = document.getElementsByClassName('lottie-container');

    if (containerLotties && containerLotties.length > 0) {
        for (var i = 0; i < containerLotties.length; i++) {
            const element = containerLotties[i];
            const animationPath = element.getAttribute('data-lottie-path');

            if (animationPath) {
                lottie.loadAnimation({
                    container: element,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    path: animationPath
                });
            } else {
                console.warn('data-lottie-path özniteliği bulunamadı:', element);
            }
        }
    }
});
