let calendevent = "";
let offcanvasElement = document.getElementById('calendar-add_edit_event');
let calendaroffcanvas=null;
if (offcanvasElement) {
    let calendaroffcanvas = new bootstrap.Offcanvas('#calendar-add_edit_event');
}
let calendarmodal = new bootstrap.Modal("#calendar-modal");
let lessonelementcreatemodal = new bootstrap.Modal("#lessonelement-create");
let sectorcreate_modal = new bootstrap.Modal("#sectorcreate_modal");

let date = new Date();
let d = date.getDate();
let m = date.getMonth();
let y = date.getFullYear();

let calendar;
// (function () {

    calendar = new FullCalendar.Calendar(document.getElementById("calendar"), {
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
        },
        themeSystem: "bootstrap",
        initialDate: new Date(y, m, 16),
        slotDuration: "00:10:00",
        navLinks: true,
        height: "auto",
        droppable: true,
        selectable: true,
        selectMirror: true,
        editable: true,
        dayMaxEvents: true,
        longPressDelay: 1,
        handleWindowResize: false,
        select: function (info) {
            console.log(info);
            var sdt = new Date(info.start);
            var edt = new Date(info.end);
            document.getElementById("pc-e-sdate").value =
                sdt.getFullYear() +
                "-" +
                getRound(sdt.getMonth() + 1) +
                "-" +
                getRound(sdt.getDate());
            document.getElementById("pc-e-edate").value =
                edt.getFullYear() +
                "-" +
                getRound(edt.getMonth() + 1) +
                "-" +
                getRound(edt.getDate());

                offcanvasElement = document.getElementById('calendar-add_edit_event');
                if (offcanvasElement) {
                    calendaroffcanvas = new bootstrap.Offcanvas('#calendar-add_edit_event');
                }
                calendarmodal = new bootstrap.Modal("#calendar-modal");

            if (calendaroffcanvas) {
                calendaroffcanvas.show();
            }
            calendar.unselect();
        },
        eventClick: function (info) {
            calendevent = info.event;
            var clickedevent = info.event;
            var slider_header = document.getElementById("slider_header");
            slider_header.innerText = "əlavə et";
            var canvas_image = document.getElementById("canvas_image");
            canvas_image.innerHTML = "";
            var e_title =
                clickedevent.title === undefined ? "" : clickedevent.title;
            var e_desc =
                clickedevent.extendedProps.description === undefined ?
                "" :
                clickedevent.extendedProps.description;
            var e_date_start =
                clickedevent.start === null ?
                "" :
                dateformat(clickedevent.start) +
                " " +
                getTime(clickedevent.start);
            var e_date_end =
                clickedevent.end === null ?
                "" :
                " <i class='text-sm'>-</i> " +
                dateformat(clickedevent.end) +
                " " +
                getTime(clickedevent.end);
            e_date_end = clickedevent.end === null ? "" : e_date_end;
            var event_id = clickedevent.id === undefined ? "" : clickedevent.id;
            var event_type =
                clickedevent.extendedProps.typeelem === undefined ?
                "" :
                clickedevent.extendedProps.typeelem;
            document.querySelector(".calendar-modal-title").innerHTML = e_title;
            document.querySelector(".pc-event-title").innerHTML = e_title;
            document.querySelector(".pc-event-description").innerHTML = e_desc;
            document.querySelector(".pc-event-date").innerHTML =
                e_date_start + e_date_end;
            document.getElementById("modal_element_id").value = event_id;
            document.getElementById("modal_element_type").value = event_type;

            var buttons = document.getElementsByClassName("modal_buttons");
            if (buttons != null && buttons.length > 0) {
                for (var i = 0; i < buttons.length; i++) {
                    if (!buttons[i].classList.contains("d-none"))
                        buttons[i].classList.add("d-none");
                }
            }

            if (event_type == "lesson") {
                files_area.classList.remove("d-none");
                var files_area_elements = document.getElementById(
                    "files_area_elements",
                );
                files_area_elements.innerHTML = '';
                var files =
                    calendevent.extendedProps.files == undefined ? [] :
                    calendevent.extendedProps.files;
                if (files != null && files.length > 0) {
                    for (var i = 0; i < files.length; i++) {
                        if (files[i] != null || files[i] != "" || files[i] != " ")
                            files_area_elements.innerHTML += `<div class="col-sm-12">${getfile(files[i], "lessongroups")}</div>`;
                    }
                } else {
                    files_area_elements.innerHTML += `<p class="text-left text-danger">Məlumat tapılmadı</p>`;
                }
            }

            var current_buttons_area = document.getElementById(
                event_type + "_buttons",
            );

            var form = document.getElementById("pc-form-event");
            form.reset();
            var form2 = document.getElementById("lessoncreate_edit");
            form2.reset();
            if (current_buttons_area != null)
                current_buttons_area.classList.remove("d-none");

            calendarmodal.show();
        },
        events: [],
    });

    calendar.render();
    document.addEventListener("DOMContentLoaded", function () {
        var calbtn = document.querySelectorAll(".fc-toolbar-chunk");
        for (var t = 0; t < calbtn.length; t++) {
            var c = calbtn[t];
            c.children[0].classList.remove("btn-group");
            c.children[0].classList.add("d-inline-flex");
        }
    });

    ["#pc_event_remove", "#pc_event_remove2"].forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener("click", removeactions);
        }
    });

    ["#pc_event_add", "#pc_event_add2"].forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener("click", function () {
                var slider_header_modal = document.getElementById("slider_header_modal");
                slider_header_modal.innerText = 'əlavə et';
                var lessoncreate_edit = document.getElementById('lessoncreate_edit');
                lessoncreate_edit.reset();
                var day = true;
                var end = null;
                var e_date_start =
                    document.getElementById("pc-e-sdate").value === null ?
                    "" :
                    document.getElementById("pc-e-sdate").value;
                var e_date_end =
                    document.getElementById("pc-e-edate").value === null ?
                    "" :
                    document.getElementById("pc-e-edate").value;
                if (!e_date_end == "") {
                    end = new Date(e_date_end);
                }
                calendar.addEvent({
                    title: document.getElementById("pc-e-title").value,
                    start: new Date(e_date_start),
                    end: end,
                    allDay: day,
                    description: document.getElementById("pc-e-description").value,
                    venue: document.getElementById("pc-e-venue").value,
                    className: document.getElementById("pc-e-type").value,
                });
                if (pc_event_add.getAttribute("data-pc-action") == "add") {
                    Swal.fire({
                        customClass: {
                            confirmButton: "btn btn-light-primary",
                        },
                        buttonsStyling: false,
                        icon: "success",
                        title: "Success",
                        text: "Event added successfully",
                    });
                } else {
                    calendevent.remove();
                    document.getElementById("pc-e-btn-text").innerHTML =
                        '<i class="align-text-bottom me-1 ti ti-calendar-plus"></i> Add';
                    document
                        .querySelector("#pc_event_add")
                        .setAttribute("data-pc-action", "add");
                    Swal.fire({
                        customClass: {
                            confirmButton: "btn btn-light-primary",
                        },
                        buttonsStyling: false,
                        icon: "success",
                        title: "Success",
                        text: "Event Updated successfully",
                    });
                }
                if (calendaroffcanvas) {
                    calendaroffcanvas.hide();
                }
                removebgs();
            });
        }
    });

    ["#pc_event_edit", "#pc_event_edit2"].forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener("click", function () {
                calendarmodal.hide();
                removebgs();
                var lesson_group_id = document.getElementById("lesson_group_id");
                lesson_group_id.value =
                    document.getElementById("modal_element_id").value;
                var modal_element_type =
                    document.getElementById("modal_element_type");
                if (modal_element_type.value != 'group')
                    getsectionsandlessonelement();

                var getinfo = getinfofunc(
                    document.getElementById("modal_element_id").value,
                    modal_element_type.value,
                );
            });
        }
    });

    ["#pc_event_element_add", "#pc_event_element_add2"].forEach((selector) => {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener("click", function () {
                calendarmodal.hide();
                removebgs();
                var lesson_group_id = document.getElementById("lesson_group_id");
                lesson_group_id.value =
                    document.getElementById("modal_element_id").value;
                getsectionsandlessonelement();
                lessonelementcreatemodal.show();
            });
        }
    });

    var createsector_button = document.querySelector("#createsector_button");
    if (createsector_button) {
        createsector_button.addEventListener("click", function () {
            var lesson_group_id_sector = document.getElementById(
                "lesson_group_id_sector",
            );
            lesson_group_id_sector.value =
                document.getElementById("modal_element_id").value;
            lessonelementcreatemodal.hide();
            removebgs();
            sectorcreate_modal.show();
        });
    }


    document.addEventListener("DOMContentLoaded", function () {
        var calbtn = document.querySelectorAll(".fc-toolbar-chunk");
        for (var t = 0; t < calbtn.length; t++) {
            var c = calbtn[t];
            c.children[0].classList.remove("btn-group");
            c.children[0].classList.add("d-inline-flex");
        }
        getelements();
    });

    calendar.render();



// });

function removeactions() {
    calendarmodal.hide();
    removebgs();
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-light-success",
            cancelButton: "btn btn-light-danger",
        },
        buttonsStyling: false,
    });
    swalWithBootstrapButtons
        .fire({
            title: "Əməliyyatı etmək istədiyinizdən əminsiniz?",
            text: "Əməliyyat geri qaytarılmır.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Bəli",
            cancelButtonText: "Xeyir",
            reverseButtons: true,
        })
        .then((result) => {
            if (result.isConfirmed) {
                calendevent.remove();
                calendarmodal.hide();
                removebgs();
                swalWithBootstrapButtons.fire(
                    "Silindi!",
                    "Dərs kalendardan çıxarıldı.",
                    "success",
                );
                removeitem();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire(
                    "Silinmədi",
                    "Administrasiya ilə əlaqəyə keçin..",
                    "error",
                );
            }
        });
}

function getRound(vale) {
    var tmp = "";
    if (vale < 10) {
        tmp = "0" + vale;
    } else {
        tmp = vale;
    }
    return tmp;
}

function getelements() {
    try {
        var formId = "getData";
        const formajax = $("#" + formId);
        const data = formajax.serialize();

        const url = formajax.attr("action");
        const method = formajax.attr("method").toUpperCase();

        $.ajax({
            url: url,
            type: method,
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"), // Assuming you have a meta tag with csrf-token
            },
            data: data,
            success: function (data) {

                if (data.calendar != null) {
                    try {
                        if (calendar)
                            calendar.removeAllEvents();

                        for (var i = 0; i < data.calendar.length; i++) {
                            var parsedjson = JSON.parse(data.calendar[i]);
                            calendar.addEvent(parsedjson);
                        }
                    } catch (error) {
                        console.error(
                            "Error adding events to calendar:",
                            error,
                        );
                    }
                }
            },
            error: function (error) {
                console.log(error);
                createnotification("Xəta", error.statusText, "error");
            },
        });
    } catch (err) {
        console.log(err);
        createnotification("Xəta", err.message, "error");
    }
}

function getinfofunc(id, type) {
    try {
        var url = "/lessongroups_info";
        var data = {
            id,
            type,
        };
        $.ajax({
            url: url,
            type: "post",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            data: data,
            success: function (data) {
                if (data.message != null)
                    createnotification(data.title, data.message, data.status);

                if (data.togglecanvas != null && data.togglecanvas == true) {
                    var canvas = $("#" + data.modal_name);
                    canvas.hide();
                    removebgs();
                    getelements();
                }

                if (data.togglemodal != null && data.togglemodal == true) {
                    var modal = $("#" + data.modal_name);
                    modal.hide();
                    removebgs();
                    if (data.modal_name == "lessonelement-create") {
                        getelements();
                    }
                }

                if (type == "group")
                    fillcanvasdata(data.data);
                else
                    fillmodaldata(data.data);

                if (data.open_modal != null) {
                    if (data.open_modal == "calendar-add_edit_event") {
                        if (calendaroffcanvas)
                            calendaroffcanvas.show();
                    } else {
                        lessonelementcreatemodal.show();
                    }
                }
            },
            error: function (error) {
                console.log(error);
                createnotification("Xəta", error.statusText, "error");
            },
        });
    } catch (err) {
        console.log(err);
        createnotification("Xəta", err.message, "error");
    }
}

function getsectionsandlessonelement() {
    try {
        var url = "lessonelements/create_edit";
        var element_id = document.getElementById("lesson_element_id");
        if (element_id && element_id.value != null) {
            url += "/" + element_id.value;
        }

        var lesson_group_id = document.getElementById("lesson_group_id");
        if (lesson_group_id != null && lesson_group_id.value != null) {
            url += "?lesson_group_id=" + lesson_group_id.value;
        }

        var modal_element_type = document.getElementById("modal_element_type");
        if (modal_element_type != null && modal_element_type.value != null) {
            url += "&element_type=" + modal_element_type.value;
        }

        $.ajax({
            url: url,
            type: "get",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            success: function (data) {
                if (data.message != null)
                    createnotification(data.title, data.message, data.status);

                var section_id = document.getElementById("section_id");
                section_id.innerHTML = "";
                var lesson_template_id = document.getElementById("lesson_template_id");
                lesson_template_id.innerHTML = '';
                var optionforir = document.createElement("option");
                optionforir.value = "";
                optionforir.text = "";
                lesson_template_id.appendChild(optionforir);
                if (data.sections != null) {
                    data.sections.forEach(function (section) {
                        var option = document.createElement("option");
                        option.value = section.id;
                        option.text = getserializedlangfordata(
                            section.name,
                            "name",
                            "az",
                        );
                        section_id.appendChild(option);
                    });
                }

                if (data.templateelements != null) {
                    data.templateelements.forEach(function (section) {
                        var option = document.createElement("option");
                        option.value = section.id;
                        option.text = getserializedlangfordata(
                            section.name,
                            "name",
                            "az",
                        );
                        lesson_template_id.appendChild(option);
                    });
                }

                var description_input = document.querySelector("textarea.description_input")
                createeditor(description_input.id)

                var notes_input = document.querySelector("textarea.notes_input")
                createeditor(notes_input.id)

                var words_input = document.querySelector("textarea.words_input")
                createeditor(words_input.id)

                var listener_text_input = document.querySelector("textarea.listener_text_input")
                createeditor(listener_text_input.id)

            },
            error: function (error) {
                console.log(error);
                createnotification("Xəta", error.statusText, "error");
            },
        });
    } catch (err) {
        console.log(err);
        createnotification("Xəta", err.message, "error");
    }
}

function change_auto_assignmode(event) {
    event.preventDefault();
    var manualassign = document.getElementById("manualassign");
    if (!manualassign.classList.contains("d-none")) {
        manualassign.classList.add("d-none");
    }
    if (!event.target.checked) {
        manualassign.classList.remove("d-none");
    }
}

function fillmodaldata(data) {
    var lesson_id_modal = document.getElementById(
        "lesson_id_modal",
    );
    lesson_id_modal.value = data.id;
    var slider_header_modal = document.getElementById("slider_header_modal");
    if (data != null && data.id != null) slider_header_modal.innerText = "yenilə";
    var lessonelement_create_name = document.getElementById("lessonelement_create_name");
    if (
        data != null &&
        data.name != null &&
        getserializedlangfordata(data.name, "name", "az") != null &&
        getserializedlangfordata(data.name, "name", "az") != "" &&
        getserializedlangfordata(data.name, "name", "az") != " "
    ) {
        lessonelement_create_name.value = getserializedlangfordata(data.name, "name", "az");
    }

    var section_id = document.getElementById("section_id");
    if (data != null && data.lesson_sections_id != null)
        section_id.value = data.lesson_sections_id;

    var pc_tinymce_5 = document.getElementById("pc-tinymce-5");
    var descriptionData = getserializedlangfordata(
        data?.description,
        "description",
        "az",
    );

    if (
        data == null ||
        (descriptionData != null &&
            descriptionData.trim() !== "" &&
            descriptionData.trim() !== " ")
    ) {
        pc_tinymce_5.innerHTML = descriptionData;
    }

    var lessonelements_order_number = document.getElementById('lessonelements_order_number');
    if (lessonelements_order_number) {
        lessonelements_order_number.value = data.order_number;
    }

    var notes_input = document.querySelector("textarea.notes_input")
    createeditor(notes_input.id)

    var words_input = document.querySelector("textarea.words_input")
    createeditor(words_input.id)

    var listener_text_input = document.querySelector("textarea.listener_text_input")
    createeditor(listener_text_input.id)


    var lessonelement_status = document.getElementById('lessonelement_status');
    lessonelement_status.checked = false;

    var manualassign = document.getElementById('manualassign');
    manualassign.classList.remove("d-none");

    if (data != null && data.starts_at != null && data.ends_at != null) {
        var startDate = new Date(data.starts_at * 1000); // UNIX zaman damgasını milisaniyeye çeviriyoruz
        var endDate = new Date(data.ends_at * 1000); // UNIX zaman damgasını milisaniyeye çeviriyoruz

        var startFormatted = startDate.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        var endFormatted = endDate.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        flatpickr(document.querySelector("#lessonelement_create_start_time"), {
            enableTime: true,
            dateFormat: "d-m-Y H:i",
            defaultDate: startFormatted,
        });

        flatpickr(document.querySelector("#lessonelement_create_end_time"), {
            enableTime: true,
            dateFormat: "d-m-Y H:i",
            defaultDate: endFormatted,
        });
    }

    // var status_modalpage = document.getElementById("status_modalpage");
    // if (data != null && data.status == true) {
    //     status_modalpage.checked = true;
    // } else {
    //     status_modalpage.checked = false;
    // }
}

function removeitem() {
    try {
        var modal_element_id = document.getElementById('modal_element_id');
        var modal_element_type = document.getElementById("modal_element_type");
        var url = "/lessongroups/destroy/" + modal_element_id.value;
        var data = {
            id: modal_element_id.value,
            type: modal_element_type.value,
        };
        $.ajax({
            url: url,
            type: "delete",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
            data: data,
            success: function (data) {
                if (data.message != null)
                    createnotification(data.title, data.message, data.status);

                if (data.togglecanvas != null && data.togglecanvas == true) {
                    var canvas = $("#" + data.modal_name);
                    canvas.hide();
                    removebgs();
                    getelements();
                }

                if (data.togglemodal != null && data.togglemodal == true) {
                    var modal = $("#" + data.modal_name);
                    modal.hide();
                    removebgs();
                    if (data.modal_name == "lessonelement-create") {
                        getelements();
                    }
                }

                if (data.open_modal != null) {
                    if (data.open_modal == "calendar-add_edit_event") {
                        if (calendaroffcanvas)
                            calendaroffcanvas.show();
                    } else {
                        lessonelementcreatemodal.show();
                    }
                }
            },
            error: function (error) {
                console.log(error);
                createnotification("Xəta", error.statusText, "error");
            },
        });
    } catch (err) {
        console.log(err);
        createnotification("Xəta", err.message, "error");
    }
}

function change_lesson_template(event) {
    try {
        showLoader();
        var data = {
            element_id: event.target.value,
            type: 'lesson'
        };
        sendAjaxRequestOLD('/lesson_templates/get_lessons_templates', 'post', data, function (e, t) {
            hideLoader();
            if (e) createnotification('Xəta', e, 'error');
            else {
                let n = JSON.parse(t);
                if (n.message != null) createnotification('Xəta', n.message, n.status);

                if (n.data != null) {
                    var lesson_template_elements_id = document.getElementById(
                        "lesson_template_elements_id");
                    if (lesson_template_elements_id) lesson_template_elements_id.value = n.data.id;
                    filltemplateordata(n.data);
                } else {
                    createnotification("@lang('additional.toastr_types_and_notifications.warning')!!!", "@lang('additional.pushmessages.not_found')", "warning");
                }
            }
        });
    } catch (error) {
        console.error("=======Change Template=====" + error);
    }
}
