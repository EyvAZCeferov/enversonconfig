function sendformdata (event, formId) {
  event.preventDefault ();
  showLoader ();
  const form = document.getElementById (formId);
  const formData = new FormData (form);
  var pc_tinymce_4 = document.getElementById ('pc-tinymce-4');
  var pc_tinymce_5 = document.getElementById ('pc-tinymce-5');

  if (pc_tinymce_4 || pc_tinymce_5) {
    var pctinymce4 = tinymce.get ('pc-tinymce-4');
    var pctinymce5 = tinymce.get ('pc-tinymce-5');
    var tinymceContent = null;

    if (pctinymce4 != null) {
      tinymceContent = pctinymce4.getContent ();
    }

    if (
      (tinymceContent == null || tinymceContent.length == 0) &&
      pctinymce5 != null
    ) {
      tinymceContent = pctinymce5.getContent ();
    }

    if (tinymceContent && tinymceContent.length > 0) {
      formData.append ('description', tinymceContent);
    }
  }

  getandseteditortexts (formData);

  let videoFile = formData.get ('video');
  if (videoFile) formData.delete ('video');

  let introvideoFile = formData.get ('intro_video');
  if (introvideoFile) formData.delete ('intro_video');

  fetch (form.action, {
    method: form.method,
    body: formData,
    headers: {
      'X-CSRF-TOKEN': formData.get ('_token'),
    },
  })
    .then (response => {
      if (response.ok) {
        return response.json ();
      } else {
        createnotification (
          'Xəta',
          'Administrator ilə əlaqə saxlayın.',
          'error'
        );
        hideLoader ();
      }
    })
    .then (data => {
      if (data.message != null)
        createnotification (data.title, data.message, data.status);

      if (data.refreshForm != null && data.refreshForm == true) form.reset ();

      if (data.append_select != null) {
        var append_select = document.getElementById (data.append_select);

        var option = document.createElement ('option');
        if (option) {
          option.value = data.data.id;
          option.text = getserializedlangfordata (data.data.name, 'name', 'az');
          append_select.appendChild (option);
        }
      }

      if (data.togglecanvas != null && data.togglecanvas == true) {
        const canvas = $ ('#' + data.modal_name);
        if (canvas.length) canvas.hide ();

        var getelementsfunction = document.getElementById (
          'getelementsfunction'
        );
        if (getelementsfunction !== null) {
          // getelementsfunction null değilse
          var value = getelementsfunction.value;
          if (value === 'true' || value === true) {
            getelements ();
          }
        }
      }

      if (data.togglemodal != null && data.togglemodal == true) {
        const modal = $ ('#' + data.modal_name);
        if (modal.length) modal.modal ('hide');

        if (data.modal_name == 'lessonelement-create') {
          var getelementsfunction = document.getElementById (
            'getelementsfunction'
          );
          if (
            (getelementsfunction && getelementsfunction.value == true) ||
            getelementsfunction.value == 'true'
          )
            getelements ();
        } else if (data.modal_name == 'showpaymentinfomodal') {
          changeanyinput (null, 'form_id');
        } else if (
          data.modal_name == 'modaladd_payment_and_category_teacher_info'
        ) {
          var setuserslessongroup = document.getElementById (
            'setuserslessongroup'
          );
          if (setuserslessongroup) setuserslessongroup.reset ();

          var payment_data_info = document.getElementById ('payment_data_info');
          if (payment_data_info) payment_data_info.innerHTML = '';

          var searchTable = document.getElementById ('searchTable');
          var searchForm = document.getElementById ('searchForm');
          if (searchTable && searchForm)
            getfordatatable (event, 'searchForm', 'searchTable');
        }
      }

      if (data.open_modal != null) {
        const openmodal = $ ('#' + data.open_modal);
        if (openmodal.length) openmodal.modal ('show');
      }

      var students_page = document.getElementById ('students_page');
      if (
        students_page &&
        (students_page.value == true || students_page.value == 'true')
      )
        getdatas (null);

      hideLoader ();

      if ((videoFile && data.uploadUrl) || (introvideoFile && data.uploadUrl)) {
        if (videoFile && data.uploadUrl) {
          uploadVideo (videoFile, data.uploadUrl, data.redirectUrl);
        }

        if (introvideoFile && data.uploadUrl) {
          uploadVideo (introvideoFile, data.uploadUrl, data.redirectUrl);
        }
      } else {
        if (data.redirectUrl != null && data.redirectUrl != '')
          window.location.href = data.redirectUrl;
      }
    })
    .catch (error => {
      hideLoader ();
      // createnotification("Xəta", error, "error");
      console.error ('An error occurred:', error.message); // Hata mesajı
      console.error ('Stack trace:', error.stack);
    });
}

function uploadVideo (videoFile, uploadUrl, redirectUrl = null) {
  try {
    const videoFormData = new FormData ();
    videoFormData.append ('video', videoFile);

    togglemodal (null, 'uploadProgressModal');

    const progressBar = document.getElementById ('progressBar');
    const xhr = new XMLHttpRequest ();
    xhr.open ('POST', uploadUrl, true);

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable) {
        const percentComplete = Math.round (event.loaded / event.total * 100);
        progressBar.style.width = percentComplete + '%';
        progressBar.setAttribute ('aria-valuenow', percentComplete);
        progressBar.textContent = percentComplete + '%';
      } else {
        console.error (
          'event.lengthComputable value false. Server not responded.'
        );
      }
    };

    xhr.timeout = 600000; // 60 saniye
    xhr.ontimeout = function () {
      console.error ('Upload timeout error.');
      createnotification ('Xəta', 'Upload timeout.', 'error');
    };

    xhr.upload.onerror = function (event) {
      console.error ('Error on upload progress:', event);
    };

    xhr.onload = function () {
      if (xhr.status == 200) {
        console.log ('Video upload complete.');
        togglemodal (null, 'uploadProgressModal');

        if (redirectUrl) window.location.href = redirectUrl;

        createnotification (
          'Success',
          'Video uploaded successfully',
          'success'
        );
      } else {
        console.error ('Video yükleme başarısız oldu.');
        createnotification ('Xəta', 'Video upload not completed.', 'error');
      }
    };

    xhr.onerror = function () {
      console.error ('upload not completed.');
      createnotification ('Xəta', 'Video upload not completed.', 'error');
    };

    xhr.send (videoFormData);
  } catch (err) {
    console.log ('video uoload errr');
    console.error (err);
  }
}

function setgetlocal (id, data = null, type = 'get') {
  try {
    if (type == 'set')
      return localStorage.setItem (
        id,
        data != null ? JSON.stringify (data) : null
      );
    else return JSON.parse (localStorage.getItem (id));
  } catch (err) {
    console.error (err);
  }
}

function getandseteditortexts (formdata = null) {
  try {
    var editors = document.querySelectorAll ('textarea');
    if (editors.length > 0) {
      editors.forEach (function (editor) {
        var value = null;
        var instance = tinymce.get (editor.id);
        if (instance != null) {
          var contentinstance = instance.getContent ();
          value = contentinstance;
        }

        if (value != null && editor.name != null)
          formdata.append (editor.name, value);
      });
    }

    return formdata;
  } catch (err) {
    console.error (err);
  }
}

function getfordatatable (event, formId, datasid) {
  try {
    event.preventDefault ();
    showLoader ();
    var data = $ (`#${formId}`).serialize ();
    const form = document.getElementById (formId);
    var dtb = Rgetandrefreshtable (datasid);
    $.ajax ({
      url: form.action,
      type: form.method,
      data: data,
      headers: {
        'X-CSRF-Token': $ ('meta[name=_token]').attr ('content'),
      },
      success: function (response) {
        hideLoader ();
        if (response.download_url != null) {
          var download_url = response.download_url;
          window.location.assign (download_url);
        } else {
          if (typeof dtb !== 'undefined' && dtb.clear) {
            dtb.clear ();
          } else {
            $ (`table#${datasid} tbody`).empty ();
          }

          if (response.elementsfortable != null) {
            response.elementsfortable.forEach (function (item, i) {
              dtb.row.add (item);
            });
            dtb.draw ();
            starttooltips ();
          } else {
            createnotification ('Diqqət!!!', 'Məlumat tapılmadı', 'warning');
          }
        }
        hideLoader ();
      },
      error: function (xhr, statusText, error) {
        hideLoader ();
        console.error ('-----GetForTable-----', error);
        createnotification ('Xəta', error, 'error');
      },
    });
  } catch (err) {
    console.error ('-----GetForTable-----', error);
  }
}

function sendAjaxRequestOLD (url, method = 'GET', data = null, callback) {
  if (event) event.preventDefault ();
  // showLoader();
  var xhr = new XMLHttpRequest ();
  xhr.timeout = 100000;
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        callback (null, xhr.responseText);
      } else {
        callback (xhr.statusText);
      }
    }
  };

  if (method.toUpperCase () === 'POST' || method.toUpperCase () === 'DELETE') {
    xhr.open (method.toUpperCase (), url);
    xhr.setRequestHeader ('Content-Type', 'application/json');
    xhr.send (JSON.stringify (data));
  } else if (method.toUpperCase () === 'GET') {
    if (data) {
      url += '?' + new URLSearchParams (data).toString ();
    }
    xhr.open ('GET', url);
    xhr.send ();
  } else {
    callback ('Unsupported method');
  }
}

function sendAjaxRequest (url, method = 'post', formData = null, callback) {
  if (event) event.preventDefault ();
  showLoader ();
  var xhr = new XMLHttpRequest ();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback (null, xhr.responseText);
      } else {
        callback (xhr.statusText);
      }
    }
  };

  if (method.toLowerCase () === 'post') {
    xhr.open ('POST', url);
    xhr.send (formData);
  } else {
    xhr.open ('GET', url);
    xhr.send ();
  }
}

function createRandomCode (type = 'int', length = 4) {
  if (type === 'int') {
    if (length === 4) {
      return Math.floor (Math.random () * 9000) + 1000;
    }
  } else if (type === 'string') {
    const characters =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt (
        Math.floor (Math.random () * charactersLength)
      );
    }
    return randomString;
  }
}

function starttooltips () {
  if ($ ('[data-toggle="tooltip"]').length > 0) {
    $ ('[data-toggle="tooltip"]').tooltip ();
  }

  if ($ ('[data-bs-toggle="tooltip"]').length > 0) {
    $ ('[data-bs-toggle="tooltip"]').tooltip ();
  }
}

function get_video_file (file, clasore, filename = null) {
  if (file == null || typeof file !== 'string' || !file.trim ()) {
    return '';
  }
  var fileextension = file.split ('.').pop ().toLowerCase ();
  var filename2 = filename != null ? filename : file;
  var randomvvidid = createRandomCode ('string', 12);

  return `<video id="${randomvvidid}" style="width:90%" height="340" controls  class="video-js" preload="auto" data-setup='{}' poster="https://courseaslan.globalmart.az/uploads/settings/1713899892.png" >
        <source src="/uploads/${clasore}/${file}" type="video/${fileextension}">
        Your browser does not support the video tag.
    </video>`;
}

function getserializedlangfordata (data, type, lang, json = true) {
  var dat;
  if (data != null) {
    if (json == true && typeof data === 'string') {
      try {
        data = JSON.parse (data);
      } catch (e) {
        console.error ('Invalid JSON string:', e);
        return '';
      }
    }

    if (type == 'name') {
      if (lang == 'az') {
        dat = data.az_name;
      } else if (lang == 'ru') {
        dat = data.ru_name;
      } else if (lang == 'en') {
        dat = data.en_name;
      } else if (lang == 'tr') {
        dat = data.tr_name;
      } else {
        dat = data.az_name;
      }
    } else if (type == 'slug') {
      if (lang == 'az') {
        dat = data.az_slug;
      } else if (lang == 'ru') {
        dat = data.ru_slug;
      } else if (lang == 'en') {
        dat = data.en_slug;
      } else if (lang == 'tr') {
        dat = data.tr_slug;
      } else {
        dat = data.az_slug;
      }
    } else if (type == 'description') {
      if (lang == 'az') {
        dat = data.az_description;
      } else if (lang == 'ru') {
        dat = data.ru_description;
      } else if (lang == 'en') {
        dat = data.en_description;
      } else if (lang == 'tr') {
        dat = data.tr_description;
      } else {
        dat = data.az_description;
      }
    } else if (type == 'slogan') {
      if (lang == 'az') {
        dat = data.az_slogan;
      } else if (lang == 'ru') {
        dat = data.ru_slogan;
      } else if (lang == 'en') {
        dat = data.en_slogan;
      } else if (lang == 'tr') {
        dat = data.tr_slogan;
      } else {
        dat = data.az_slogan;
      }
    } else if (type == 'additional_data') {
      if (lang == 'video') {
        dat = data.video ? get_video_file (data.video, 'lessongroups') : '';
      } else if (lang == 'notes') {
        dat = data.notes || '';
      } else if (lang == 'words') {
        dat = data.words || '';
      } else if (lang == 'sentences') {
        dat = data.sentences || '';
      } else if (lang == 'texts') {
        dat = data.texts || '';
      } else if (lang == 'tapsiriq_text') {
        dat = data.tapsiriq_text || '';
      } else if (lang == 'example_text') {
        dat = data.example_text || '';
      } else if (lang == 'thanks_text') {
        dat = data.thanks_text || '';
      }
    } else if (type == 'listener_files') {
      if (lang == 'file') {
        dat = data.file ? getfile (data.file, 'lessongroups') : null;
      } else if (lang == 'listener_text') {
        dat = data.listener_text || '';
      }
    } else if (type == 'speaking_files') {
      if (lang == 'file') {
        dat = data.file ? getfile (data.file, 'lessongroups') : null;
      } else if (lang == 'speaking_text') {
        dat = data.speaking_text || '';
      }
    } else if (type == 'image_files') {
      if (lang == 'file') {
        dat = data.file ? getfile (data.file, 'lessongroups') : null;
      } else if (lang == 'image') {
        dat = data.image || '';
      } else if (lang == 'image_text') {
        dat = data.image_text || '';
      } else if (lang == 'image_input') {
        dat = data.image_input || data.image_text;
      }
    } else if (type == 'minutes') {
      if (lang == 'description') {
        dat = data.description || '';
      } else if (lang == 'video') {
        dat = data.video || '';
      } else if (lang == 'exam') {
        dat = data.exam || '';
      } else if (lang == 'notes') {
        dat = data.notes || '';
      } else if (lang == 'words') {
        dat = data.words || '';
      } else if (lang == 'sentences') {
        dat = data.sentences || '';
      } else if (lang == 'texts') {
        dat = data.texts || '';
      } else if (lang == 'files') {
        dat = data.files || '';
      } else if (lang == 'listenandread') {
        dat = data.listenandread || '';
      } else if (lang == 'speakingandread') {
        dat = data.speakingandread || '';
      } else if (lang == 'imageexample') {
        dat = data.imageexample || '';
      } else if (lang == 'testandexample') {
        dat = data.testandexample || '';
      }
    } else if (type == 'premium_fields') {
      if (lang == 'description') {
        dat = data.description || false;
      } else if (lang == 'video') {
        dat = data.video || false;
      } else if (lang == 'exam') {
        dat = data.exam || false;
      } else if (lang == 'notes') {
        dat = data.notes || false;
      } else if (lang == 'words') {
        dat = data.words || false;
      } else if (lang == 'sentences') {
        dat = data.sentences || false;
      } else if (lang == 'texts') {
        dat = data.texts || false;
      } else if (lang == 'files') {
        dat = data.files || false;
      } else if (lang == 'listener_files') {
        dat = data.listener_files || false;
      } else if (lang == 'speaking_files') {
        dat = data.speaking_files || false;
      } else if (lang == 'image_files') {
        dat = data.image_files || false;
      } else if (lang == 'example_test_tapsiriq') {
        dat = data.example_test_tapsiriq || false;
      }
    } else if (type == 'prices') {
      if (lang == 'price') {
        dat = data.price || 0;
      } else if (lang == 'number_of_lessons_in_month') {
        dat = data.number_of_lessons_in_month || '';
      }
    }
  } else {
    dat = '';
  }

  return dat;
}

function getfile (file, clasore, filename = null) {
  if (file == null || typeof file !== 'string' || !file.trim ()) {
    return '';
  }

  var fileextension = file.split ('.').pop ().toLowerCase ();
  var filename2 = filename != null ? filename : file;
  var randomvvidid = createRandomCode ('string', 12);
  switch (fileextension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
    case 'heic':
      return `<img src="/uploads/${clasore}/${file}" class="img-fluid img-responsive" alt="${filename2}" />`;

    case 'pdf':
      return `<iframe src="/uploads/${clasore}/${file}" width="600" height="400"></iframe>`;

    case 'doc':
    case 'docx':
      return `<a href="/uploads/${clasore}/${file}" download>${filename2}</a>`;

    case 'xls':
    case 'xlsx':
      return `<a href="/uploads/${clasore}/${file}" download>${filename2}</a>`;

    case 'txt':
      return `<a href="/uploads/${clasore}/${file}" download>${filename2}</a>`;

    case 'mp3':
      return `<audio controls preload="auto" id="${randomvvidid}">
                    <source src="/uploads/${clasore}/${file}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>`;

    case 'mp4':
    case 'avi':
    case 'mov':
      return `
      <div class="video-container">
            <div class="loader_video" id="loader_video"></div>
                <video id="${randomvvidid}" style="width:90%" height="340" controls class="video-js" preload="auto" data-setup='{}' poster="https://enverson.com/uploads/settings/1713899892.png" data-clasore="${clasore}" data-file="${file}" data-src="/uploads/${clasore}/${file}">
                    <source src="/uploads/${clasore}/${file}" type="video/${fileextension}" />
                    <p class="vjs-no-js">
                    Js not support
                    </p>
                </video>
            </div>
        </div>
            `;
    default:
      return ``;
  }
}

function getfileExtension (file) {
  if (file == null || typeof file !== 'string' || !file.trim ()) {
    return '';
  }

  var fileextension = file.split ('.').pop ().toLowerCase ();
  switch (fileextension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'types_image.png';

    case 'pdf':
      return 'types_pdf.png';

    case 'doc':
    case 'docx':
      return 'types_docx.png';

    case 'xls':
    case 'xlsx':
      return 'types_xlsx.png';

    case 'txt':
      return 'types_file.png';

    case 'mp3':
      return 'types_audio.png';

    case 'mp4':
    case 'avi':
    case 'mov':
      return 'types_video.png';

    default:
      return 'types_file.png';
  }
}

function toggleskill (code = null, action, user_id) {
  try {
    if (action == 'remove') {
      var codeel = `skill_${code}`;
      var elementskill = document.getElementById (codeel);
      if (elementskill != null) elementskill.remove ();
    } else {
      var code = createRandomCode ('string', 12);
      var area = document.getElementById ('skills_area');
      var elementskill = `<div class="row" id="skill_${code}">
            <input type="hidden" name="skills[${code}][user_id]" value="${user_id}">
            <input type="hidden" name="skills[${code}][order_number]" value="1" />
            <div class="col-sm-5 col-md-5 col-lg-4">
                <div class="form-group">
                    <label for="">Ad</label>
                    <input type="text" name="skills[${code}][name]" class="form-control" />
                </div>
            </div>
            <div class="col-sm-5 col-md-5 col-lg-4">
                <div class="form-group">
                    <label for="">Faiz</label>
                    <input type="text" name="skills[${code}][count]" class="form-control"/>
                </div>
            </div>
            <div class="col-sm-2 col-md-2 col-lg-4">
                <div class="form-group">
                    <label for=""> </label>
                    <button class="btn btn-danger btn-sm" type="button" onclick="toggleskill('${code}','remove',${user_id})"><i class="fa fa-trash"></i></button>
                </div>
            </div>
        </div>`;
      area.innerHTML += elementskill;
    }
  } catch (err) {
    console.log (err);
  }
}

function createRandomCode (type = 'int', length = 4) {
  if (type === 'int') {
    if (length === 4) {
      return Math.floor (Math.random () * (9999 - 1000 + 1)) + 1000;
    }
  } else if (type === 'string') {
    const characters =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charactersLength = characters.length;
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt (
        Math.floor (Math.random () * charactersLength)
      );
    }
    return randomString;
  }
}

function showLoader () {
  var loader = document.getElementById ('loader');
  if (loader) loader.classList.add ('active');
}

function hideLoader () {
  var loader = document.getElementById ('loader');
  if (loader) loader.classList.remove ('active');
}

let table_dt = null;

function Rgetandrefreshtable (tb_id = null, type = 'normal') {
  try {
    var classname = '.custom__table';
    if (tb_id != null) {
      if ((tb_id.match (/#/g) || []).length === 2) {
        tb_id = tb_id.replace ('#', '');
      }

      if (!tb_id.startsWith ('#')) {
        tb_id = '#' + tb_id;
      }
      classname = `#${tb_id}`;
    }
    var element = initializeDataTable_RGET (classname, type);
    return element;
  } catch (err) {
    console.error ('------Rgetandrefreshtable-----' + err);
  }
}

function initaudioplayers () {
  try {
    // var audiotags = document.querySelectorAll("audio");
    // if (audiotags) {
    //     for (var i = 0; i < audiotags.length; i++) {
    //         var element = audiotags[i];
    //         console.log(element,element.id)
    //         GreenAudioPlayer.init({
    //             selector: '#' + element.id
    //         });
    //     }
    // }
  } catch (err) {
    console.error ('Audio Player initialize error', err);
  }
}

function clearCache () {
  const links = document.querySelectorAll (
    'link[rel="stylesheet"], script[src]'
  );

  links.forEach (function (element) {
    const srcAttr = element.tagName === 'SCRIPT' ? 'src' : 'href';
    const url = element.getAttribute (srcAttr);

    if (url) {
      // URL'ye zaman damgası veya rastgele değer ekle
      const newUrl = url.split ('?')[0] + '?v=' + new Date ().getTime ();
      element.setAttribute (srcAttr, newUrl);
    }
  });
}

function change_lesson_showns (event, id) {
  event.preventDefault ();
  try {
    var data = {
      id,
    };
    showLoader ();
    sendAjaxRequestOLD ('/change_shown_status', 'post', data, function (e, t) {
      hideLoader ();
      if (e) createnotification ('Xəta', e, 'error');
      else {
        let n = JSON.parse (t);
        if (n.message != null) createnotification ('Xəta', n.message, n.status);

        if (n.status == 'success') {
          createnotification ('Xəta', n.message, n.status);
        }
      }
    });
  } catch (err) {
    console.error (err);
  }
}

function initializeDataTable_RGET (tb_id, type = 'normal') {
  try {
    if ((tb_id.match (/#/g) || []).length === 2) {
      tb_id = tb_id.replace ('#', '');
    }

    if (!tb_id.startsWith ('#')) {
      tb_id = '#' + tb_id;
    }

    var $table = $ (tb_id);

    if ($.fn.DataTable && $.fn.DataTable.isDataTable ($table)) {
      $table.DataTable ().destroy ();
      table_dt = null;
    }

    if (type == 'normal') {
      table_dt = $table.DataTable ({
        // scrollCollapse: true,
        // responsive: true,
        // ordering: false,
        // rowReorder: false,
        searching: true,
        // colReorder: true,
        // aLengthMenu: [
        //     [50, 100, 200, -1],
        //     [50, 100, 200, "All"]
        // ],
        // fixedColumns: {
        //     left: 1,
        //     right: 1,
        // },
        // columnDefs: [{
        //     'targets': '_all',
        //     orderable: true,
        //     width: 'auto',
        //     maxWidth: '100%',
        // }],
        iDisplayLength: 50,
        // autoWidth: true,
        // scrollX: true,
        // orderCellsTop: true,
        // fixedHeader: true,
        paging: false,
        // search: true,
        buttons: ['copy', 'excel', 'pdf', 'colvis', 'print'],
        dom: "<'table__top toolbar' Bflip>" +
          "<'table' tr>" +
          "<'table__bottom'ip>",
      });

      // $table.columns.adjust().responsive.recalc().draw(false);

      $table.find ('thead .search-filter').on ('keyup', function () {
        var columnIndex = $ (this).closest ('th').index ();
        table_dt.column (columnIndex).search (this.value).draw ();
      });

      $ (
        document
      ).on ('change', '.column__filters .columns input', function () {
        var th = $ (this);
        var content = th.html ();
      });

      $table.on ('page', function () {});

      $ (document).on ('click', '.column__filter__toggle', function () {
        $ (this)
          .closest ('.column__filters')
          .find ('.columns')
          .toggleClass ('show');
      });

      $ (document).on ('click', function (e) {});

      $table.find ('thead th.sortable').on ('click', function () {
        var th = $ (this);
        var content = th.html ();
        th.empty ().html (content);
        var columnIndex = th.index ();
        table_dt.order ([columnIndex, 'asc']).draw ();
      });
    } else {
      table_dt = new simpleDatatables.DataTable (tb_id, {
        sortable: false,
        searchable: true,
        perPage: 50,
        perPageSelect: [10, 25, 50, 100, 'All'],
      });
    }
    return table_dt;
  } catch (err) {
    console.error ('---INITIALIZE DATATABLE RGET----', err);
  }
}

function add_to_body (tableId, data, many = true) {
  try {
    let tbody = document.querySelector (`table#${tableId} tbody`);

    if (!tbody) {
      console.error (`Table with ID ${tableId} not found.`);
      return;
    }

    if (many === true) {
      data.forEach (row => {
        let tr = document.createElement ('tr');
        row.forEach (cell => {
          let td = document.createElement ('td');
          td.classList.add ('text-center');
          td.innerHTML = cell;
          tr.appendChild (td);
        });
        tbody.appendChild (tr);
      });
    } else {
      let tr = document.createElement ('tr');
      data.forEach (cell => {
        let td = document.createElement ('td');
        td.classList.add ('text-center');
        td.innerHTML = cell;
        tr.appendChild (td);
      });
      tbody.appendChild (tr);
    }

    let tableElement = document.querySelector (`table#${tableId}`);

    let searchContainer = tableElement.parentNode.querySelector (
      '.search-container'
    );
    if (!searchContainer) {
      searchContainer = document.createElement ('div');
      searchContainer.className = 'search-container';
      searchContainer.style.textAlign = 'right';
      searchContainer.style.marginBottom = '10px';
      searchContainer.style.display = 'flex';
      searchContainer.style.flexDirection = 'row-reverse';

      let searchInput = document.createElement ('input');
      searchInput.type = 'text';
      searchInput.style.width = '35%';
      searchInput.className = 'dataTable-input';
      searchInput.placeholder = 'Search...';
      searchInput.onkeyup = function (event) {
        search_on_table (event, tableId);
      };

      searchContainer.appendChild (searchInput);

      tableElement.parentNode.insertBefore (searchContainer, tableElement);
    }

    let headers = document.querySelectorAll (`table#${tableId} thead th`);
    headers.forEach ((header, index) => {
      header.style.cursor = 'pointer';
      header.addEventListener ('click', function () {
        sortTable (tableId, index);
      });
    });
  } catch (err) {
    console.error (err);
  }
}

function search_on_table (event, tableId) {
  let value = event.target.value.toLowerCase ();
  let table = document.querySelector (`table#${tableId}`);
  let rows = table.querySelectorAll ('tbody tr');

  rows.forEach (row => {
    let rowText = row.innerText.toLowerCase ();
    row.style.display = rowText.includes (value) ? '' : 'none';
  });
}

function sortTable (tableId, colIndex) {
  let table = document.querySelector (`table#${tableId}`);
  let rows = Array.from (table.querySelectorAll ('tbody tr'));
  let ascending = table.getAttribute (`data-sort-asc-${colIndex}`) !== 'true';

  rows.sort (function (rowA, rowB) {
    let cellA = rowA.querySelectorAll ('td')[colIndex].innerText.toLowerCase ();
    let cellB = rowB.querySelectorAll ('td')[colIndex].innerText.toLowerCase ();

    if (cellA < cellB) {
      return ascending ? -1 : 1;
    }
    if (cellA > cellB) {
      return ascending ? 1 : -1;
    }
    return 0;
  });

  table.setAttribute (`data-sort-asc-${colIndex}`, ascending);

  // Yeni sıralanmış satırları tbody'e tekrar ekle
  let tbody = table.querySelector ('tbody');
  tbody.innerHTML = '';
  rows.forEach (row => tbody.appendChild (row));
}

//  get time
function getTime (temp) {
  temp = new Date (temp);
  if (temp.getHours () != null) {
    var hour = temp.getHours ();
    var minute = temp.getMinutes () ? temp.getMinutes () : '00';
    return hour + ':' + minute;
  }
}

//  get date
function dateformat (dt) {
  var mn = [
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'İyun',
    'İyul',
    'Avqust',
    'Sentyabr',
    'Oktyabr',
    'Noyabr',
    'Dekabr',
  ];
  var d = new Date (dt),
    month = '' + mn[d.getMonth ()],
    day = '' + d.getDate (),
    year = d.getFullYear ();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [day + ' ' + month, year].join (',');
}

//  get full date
function timeformat (time) {
  var temp = time.split (':');
  var hours = temp[0];
  var minutes = temp[1];
  var newformat = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + newformat;
}

function convertcreatedatwithampm (createdAt) {
  const date = new Date (createdAt);

  const day = String (date.getDate ()).padStart (2, '0');
  const month = String (date.getMonth () + 1).padStart (2, '0'); // Aylar 0-11 arasıdır, bu yüzden +1 eklenir.
  const year = date.getFullYear ();

  let hours = date.getHours ();
  const minutes = String (date.getMinutes ()).padStart (2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Saat 0 ise 12 olarak ayarla

  const formattedDate = `${day}.${month}.${year} ${hours}:${minutes} ${ampm}`;
  return formattedDate;
}

function unixTimestampToDateTime (timestamp) {
  // UNIX zaman damgasını milisaniye cinsinden dönüştür
  var date = new Date (timestamp * 1000);

  // Tarih ve saat bilgilerini al
  var day = date.getDate ();
  var month = date.getMonth () + 1; // JavaScript'te aylar 0'dan başlar, bu yüzden +1 ekliyoruz
  var year = date.getFullYear ();
  var hours = date.getHours ();
  var minutes = date.getMinutes ();

  // İstenen formatı oluştur
  var formattedDateTime =
    day.toString ().padStart (2, '0') +
    '.' +
    month.toString ().padStart (2, '0') +
    '.' +
    year +
    ' ' +
    hours.toString ().padStart (2, '0') +
    ':' +
    minutes.toString ().padStart (2, '0');

  return formattedDateTime;
}

function notificationfunctions (user_id, type) {
  try {
    var data = {
      user_id,
      type,
    };
    var notification_list = document.getElementById ('notification_list');
    var notification_count_badge = document.getElementById (
      'notification_count_badge'
    );
    showLoader ();
    sendAjaxRequestOLD (
      '/notifications/notification_actions',
      'post',
      data,
      function (e, t) {
        hideLoader ();
        if (e) createnotification ('Xəta', e, 'error');
        else {
          let n = JSON.parse (t);
          if (n.message != null)
            createnotification ('Xəta', n.message, n.status);

          if (n.status == 'success') {
            notification_list.innerHTML =
              '<span class="text-danger">Oxunmamış bildiriş mövcud deyil</span>';
            notification_count_badge.innerHTML = '';
          }
        }
      }
    );
  } catch (err) {
    console.error ('==========NotificationFunctions=======' + err);
  }
}

document.addEventListener ('DOMContentLoaded', function () {
  showLoader ();
});

function removebgs () {
  $ ('.modal').each (function () {
    if ($ (this).hasClass ('show')) {
      $ (this).hide ();
    }
  });

  $ ('.modal-backdrop').each (function () {
    if ($ (this).hasClass ('show')) {
      $ (this).hide ();
    }
  });

  $ ('.offcanvas').each (function () {
    if ($ (this).hasClass ('show')) {
      $ (this).hide ();
    }
  });

  $ ('.offcanvas-backdrop').each (function () {
    if ($ (this).hasClass ('show')) {
      $ (this).hide ();
    }
  });
}

window.addEventListener ('load', function () {
  hideLoader ();
  getcontactuscount ();
});

function togglemodal (event = null, modal) {
  if (event) event.preventDefault ();

  try {
    var modal = $ (`#${modal}`);
    if (modal.hasClass ('show')) {
      modal.modal ('hide');
    } else {
      modal.modal ('show');
    }
  } catch (err) {
    console.error (err);
  }
}

function togglemodalnow (event = null, idelement) {
  var modal = document.getElementById (idelement);
  var overlay = document.getElementById ('myModalOverlay');
  if (modal.classList.contains ('show')) {
    if (overlay) {
      overlay.remove ();
    }
    modal.classList.remove ('show');
    modal.style.display = 'none';
  } else {
    modal.style.display = 'block';
    modal.classList.add ('show');
    overlay = document.createElement ('div');
    overlay.id = 'myModalOverlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild (overlay);
  }
}

function getcontactuscount () {
  try {
    var authenticated_id = document.getElementById ('authenticated_id');
    var countofcontactus = document.getElementById ('countofcontactus');
    if (authenticated_id && countofcontactus) {
      var data = {
        auth_id: authenticated_id.value,
      };
      sendAjaxRequestOLD (
        '/notifications/get_notification_count',
        'post',
        data,
        function (e, t) {
          if (e) console.error (e);
          else {
            var n = JSON.parse (t);
            if (n.data != null) {
              countofcontactus.innerHTML = n.data;
            }
          }
        }
      );
    }
  } catch (err) {
    console.error (err);
  }
}

// setInterval(() => {
//     getcontactuscount();
// }, 1500);

function createeditor (id = null, value = null) {
  try {
    var selector = id ? `#${id}` : `.summernote_element`;
    let tinmyMceInstance = tinymce.get (id);
    if (tinmyMceInstance == null) {
      tinymce.init ({
        selector: selector,
        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
        toolbar: 'fontfamily fontsize forecolor backcolor | bold italic underline strikethrough subscript superscript | link image media table blockquote | align lineheight | numlist bullist indent outdent | charmap',
        menubar: false,
        image_advtab: false,
        a11y_advanced_options: true,
        image_caption: true,
        image_description: false,
        image_dimensions: false,
        image_title: true,
        images_upload_credentials: true,
        images_upload_url: '/api/upload_image_editor',
        automatic_uploads: true,
        block_unsupported_drop: false,
        file_picker_types: 'file image media',
        images_upload_handler: function (blobInfo, progress) {
          return new Promise ((resolve, reject) => {
            var url = '/api/upload_image_editor';
            var formData = new FormData ();
            formData.append ('image', blobInfo.blob (), blobInfo.filename ());

            var xhr = new XMLHttpRequest ();
            xhr.open ('POST', url, true);

            xhr.onload = function () {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  var response = JSON.parse (xhr.responseText);
                  resolve (response.location);
                } catch (error) {
                  console.error ('Error parsing response:', error);
                  reject ('Invalid JSON response');
                }
              } else {
                console.error (
                  'Error during image upload:',
                  xhr.status,
                  xhr.statusText
                );
                reject (`Upload failed: ${xhr.statusText}`);
              }
            };

            xhr.onerror = function () {
              console.error (
                'Error during image upload:',
                xhr.status,
                xhr.statusText
              );
              reject ('Network error during upload');
            };

            xhr.send (formData);
          });
        },
        toolbar_mode: 'floating',
        inline: false,
        directionality: 'ltr',
        setup: function (editor) {
          editor.setContent (value);
          editor.on (
            'init',
            function (e, value) {
              if (value != null) editor.setContent (value);
              editor.getContainer ().style.width = '100%';
              // editor.getContainer().style.display = 'inline-block';
            }.bind (null, null, value)
          );
        },
      });
      setTimeout (() => {
        var tiny = tinymce.get (id);
        tiny.setContent (value);
        return tiny;
      }, 1000);
    } else {
      if (tinmyMceInstance) tinmyMceInstance.remove ();
      return createeditor (id, value);
    }
  } catch (error) {
    console.error ('------------createeditorError----------------', error);
  }
}

function getcontenteditor (id = null) {
  try {
    var selector = id ? `#${id}` : `.summernote_element`;
    let instance = tinymce.get (id);
    if (instance != null) {
      var contentinstance = instance.getContent ();
      return contentinstance;
    } else {
      return '';
    }
  } catch (error) {
    console.error ('------------getcontentmce----------------', error);
  }
}

async function translateWithFallbackNotExist (array, targetLanguage) {
  try {
    if (array[targetLanguage]) {
      return array[targetLanguage];
    } else {
      if (array['az'] && array['az'].trim ()) {
        return await libretranslate (array['az'], targetLanguage);
      } else if (array['ru'] && array['ru'].trim ()) {
        return await libretranslate (array['ru'], targetLanguage);
      } else if (array['en'] && array['en'].trim ()) {
        return await libretranslate (array['en'], targetLanguage);
      }
    }
  } catch (error) {
    console.error ('Translation failed:', error);
    return array[targetLanguage];
  }
}

async function translateToOtherLang (text, targetLanguage) {
  try {
    return await libretranslate (text, targetLanguage);
  } catch (error) {
    console.error ('Translation failed:', error);
    return array[targetLanguage];
  }
}

function googleTranslate (text, targetLanguage) {
  return new Promise ((resolve, reject) => {
    const apiKey = 'AIzaSyAMn4vCk3qCp58Fr8NwhDfxlVt_5FWwOJU';
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const xhr = new XMLHttpRequest ();
    xhr.open ('POST', url, true);
    xhr.setRequestHeader ('Content-Type', 'application/json');

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse (xhr.responseText);
          if (result.data && result.data.translations) {
            resolve (result.data.translations[0].translatedText);
          } else {
            resolve (text); // Return original text if no translation is found
          }
        } catch (error) {
          console.error ('Error parsing JSON:', error);
          reject (error);
        }
      } else {
        reject (`Error: ${xhr.statusText}`);
      }
    };

    xhr.onerror = function () {
      reject ('Network error during translation request');
    };

    const body = JSON.stringify ({
      q: text,
      target: targetLanguage,
    });

    xhr.send (body);
  });
}

function libretranslate (text, targetLanguage) {
  return new Promise ((resolve, reject) => {
    const url = 'https://libretranslate.de/translate';

    const xhr = new XMLHttpRequest ();
    xhr.open ('POST', url, true);
    xhr.setRequestHeader ('Content-Type', 'application/json');

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse (xhr.responseText);
          if (result && result.translatedText) {
            resolve (result.translatedText);
          } else {
            resolve (text); // Return original text if no translation is found
          }
        } catch (error) {
          console.error ('Error parsing JSON:', error);
          reject (error);
        }
      } else {
        reject (`Error: ${xhr.statusText}`);
      }
    };

    xhr.onerror = function () {
      reject ('Network error during translation request');
    };

    const body = JSON.stringify ({
      q: text,
      source: 'auto',
      target: targetLanguage,
      format: 'text',
    });

    xhr.send (body);
  });
}

function printpage (event) {
  event.preventDefault ();

  var printable_area = document.getElementById ('printable_area');
  if (printable_area) {
    var clone = printable_area.cloneNode (true);
    var elementsToRemove = clone.querySelectorAll ('.not_shown_on_print');

    elementsToRemove.forEach (function (element) {
      element.remove ();
    });

    var a = window.open ('', '', 'height=1000, width=1000');
    a.document.write ('<html>');
    a.document.write ('<head>');

    var stylesheets = document.styleSheets;
    for (var i = 0; i < stylesheets.length; i++) {
      try {
        if (stylesheets[i].href) {
          a.document.write (
            '<link rel="stylesheet" href="' +
              stylesheets[i].href +
              '" type="text/css" media="print"/>'
          );
        } else if (stylesheets[i].cssRules) {
          var cssText = '';
          for (var j = 0; j < stylesheets[i].cssRules.length; j++) {
            cssText += stylesheets[i].cssRules[j].cssText;
          }
          a.document.write (
            '<style type="text/css" media="print">' + cssText + '</style>'
          );
        }
      } catch (e) {
        console.warn ('CSS kuralı alınamadı: ', e);
      }
    }

    a.document.write ('</head>');
    a.document.write ('<body>');

    a.document.write (clone.innerHTML);
    a.document.write ('</body></html>');

    a.document.close ();
    a.focus ();

    setTimeout (function () {
      a.print ();
    }, 1000);
  }
}

function downloadAsPDF (event, ordernumber) {
  event.preventDefault ();
  try {
    var printable_area = document.getElementById ('printable_area');
    if (printable_area) {
      var clone = printable_area.cloneNode (true);
      var elementsToRemove = clone.querySelectorAll ('.not_shown_on_print');

      elementsToRemove.forEach (function (element) {
        element.remove ();
      });

      var styles = '';
      var stylesheets = document.styleSheets;
      for (var i = 0; i < stylesheets.length; i++) {
        try {
          if (stylesheets[i].cssRules) {
            for (var j = 0; j < stylesheets[i].cssRules.length; j++) {
              styles += stylesheets[i].cssRules[j].cssText;
            }
          }
        } catch (e) {
          console.warn ('CSS kuralı alınamadı: ', e);
        }
      }

      var styleElement = document.createElement ('style');
      styleElement.type = 'text/css';
      styleElement.media = 'print';
      styleElement.appendChild (document.createTextNode (styles));
      clone.insertBefore (styleElement, clone.firstChild);

      var options = {
        margin: 0.5,
        filename: 'order' + ordernumber + '.pdf',
        image: {type: 'jpeg', quality: 0.98},
        html2canvas: {scale: 2},
        jsPDF: {unit: 'in', format: 'letter', orientation: 'portrait'},
      };

      html2pdf ().from (clone).set (options).save ();
    }
  } catch (err) {
    console.error (err);
  }
}

function window_change_url (url) {
  window.location.href = url;
}

window.onload = function () {
  const aiBanner = document.getElementById ('ai_banner');

  if (aiBanner) {
    const pcContent = document.querySelector (
      'section.pc-container div.pc-content'
    );
    if (pcContent) {
      if (aiBanner && aiBanner.classList.contains ('d-none'))
        aiBanner.classList.remove ('d-none');

      pcContent.insertAdjacentElement ('afterbegin', aiBanner);
    } else {
      console.error ('pc-content elementi bulunamadı.');
    }
  } else {
    console.error ('ai_banner elementi bulunamadı.');
  }
};

function get_welcome_area () {
  try {
    var authenticated_id = document.getElementById ('authenticated_id');
    var widgets = document.getElementById ('widgets');

    var data = {auth_id: authenticated_id.value};

    sendAjaxRequestOLD ('/api/get_welcome_area', 'post', data, function (e, t) {
      hideLoader ();
      if (e) createnotification ('Xəta', e, 'error');
      else {
        let n = JSON.parse (t);
        if (n.message != null) createnotification ('Xəta', n.message, n.status);

        if (n.htmlresult['widgets']) {
          widgets.innerHTML = n.htmlresult['widgets'];
        }
      }
    });
  } catch (err) {
    console.error (err);
  }
}

let scrollTimeout;
window.addEventListener ('scroll', () => {
  if (scrollTimeout) {
    window.cancelAnimationFrame (scrollTimeout);
  }
});
