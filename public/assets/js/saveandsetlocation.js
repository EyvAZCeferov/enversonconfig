document.addEventListener('DOMContentLoaded', function() {
    getLocationAndSave();
});

function getLocationAndSave() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(savePosition, showError);
    }
}

function savePosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    // AJAX isteği ile konumu veritabanına kaydet
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/set_location', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="_token"]').getAttribute('content'));

    var authenticated_id=document.getElementById("authenticated_id");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
        } else if (xhr.readyState === 4) {
            Swal.fire(Lang.get("messages.23july.locationinfonotcollected"));
        }
    };

    var data = JSON.stringify({
        latitude: latitude,
        longitude: longitude,
        auth_id : authenticated_id.value??null
    });
    xhr.send(data);
}

function showError(error) {
    // switch(error.code) {
    //     case error.PERMISSION_DENIED:
    //         Swal.fire({
    //             title: Lang.get("messages.23july.perissionsdeclined"),
    //             text: Lang.get('messages.23july.permissionsrequired'),
    //             icon: 'warning',
    //             showCancelButton: true,
    //             confirmButtonText: Lang.get("messages.buttons.retry"),
    //             cancelButtonText: Lang.get("messages.buttons.cancel"),
    //         }).then((result) => {
    //             if (result.isConfirmed) {
    //                 getLocationAndSave();
    //             }
    //         });
    //         break;
    //     case error.POSITION_UNAVAILABLE:
    //         Swal.fire(Lang.get("messages.23july.yourbrowsernotsupportedlocation"));
    //         break;
    //     case error.TIMEOUT:
    //         Swal.fire(Lang.get("messages.23july.yourbrowsernotsupportedlocation"));
    //         break;
    //     case error.UNKNOWN_ERROR:
    //         Swal.fire(Lang.get("messages.23july.yourbrowsernotsupportedlocation"));
    //         break;
    // }
}
