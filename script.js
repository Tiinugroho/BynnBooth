const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const resetButton = document.getElementById('reset');
const printButton = document.getElementById('print');
const bgSelect = document.getElementById('bgSelect');
const gridSelect = document.getElementById('gridSelect');
const mainCanvas = document.getElementById('mainCanvas');
const mainCtx = mainCanvas.getContext('2d');
const frameSelect = document.getElementById('frameSelect');

document.addEventListener("DOMContentLoaded", function () {
    // Saat halaman pertama kali dimuat, set default frame kosong dan background putih
    frameSelect.value = "none";
    bgSelect.value = "white";
    setCanvasSize();
    updateCanvasScale();
    redrawCanvas();
});

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        return video.play(); // Memastikan video mulai berjalan
    })
    .catch(err => Swal.fire("Gagal mengakses kamera!", "Pastikan izin kamera diaktifkan.", "error"));


let photos = [];

function setCanvasSize() {
    if (gridSelect.value === "2x2") {
        mainCanvas.width = 520;
        mainCanvas.height = frameSelect.value === "spotify" ? 850 : 745; // Tambah tinggi jika Spotify
    } else {
        mainCanvas.width = 270;
        mainCanvas.height = frameSelect.value === "spotify" ? 1550 : 1425; // Tambah tinggi jika Spotify
    }
}

function getGridPosition(index) {
    const grid = gridSelect.value;
    const gap = 20;
    const photoWidth = 230;
    const photoHeight = 320;

    if (grid === "2x2") {
        return [{
                x: gap,
                y: gap
            },
            {
                x: photoWidth + gap * 2,
                y: gap
            },
            {
                x: gap,
                y: photoHeight + gap * 2
            },
            {
                x: photoWidth + gap * 2,
                y: photoHeight + gap * 2
            }
        ][index];
    } else {
        return {
            x: (mainCanvas.width - photoWidth) / 2,
            y: gap + (photoHeight + gap) * index + 10 // Tambah padding agar garis tidak hilang
        };
    }
}

function addCopyrightText() {
    let isSmall = gridSelect.value === "1x4"; // Periksa apakah mode 1x4
    let fontSize = isSmall ? "10px" : "14px"; // Font lebih kecil jika 1x4
    let positionY = isSmall ? mainCanvas.height - 20 : mainCanvas.height - 25; // Posisi lebih tinggi jika kecil

    mainCtx.font = `${fontSize} Arial`;
    mainCtx.fillStyle = bgSelect.value === "white" ? "black" : "white";
    mainCtx.textAlign = "center";
    mainCtx.fillText("© 2025 BynnBooth", mainCanvas.width / 2, positionY);
}

function addCopyrightTextToSpotify() {
    let isSmall = gridSelect.value === "1x4"; // Periksa apakah mode 1x4
    let fontSize = isSmall ? "10px" : "14px"; // Font lebih kecil jika 1x4
    let positionY = isSmall ? mainCanvas.height - 10 : mainCanvas.height - 15; // Posisi lebih tinggi jika kecil

    mainCtx.font = `${fontSize} Arial`;
    mainCtx.fillStyle = "white"; // Warna abu-abu khas Spotify
    mainCtx.textAlign = "center";
    mainCtx.fillText("© 2025 BynnBooth", mainCanvas.width / 2, positionY);
}

function redrawCanvas() {
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    let frameImage = new Image();
    let framePath = getFramePath(frameSelect.value);

    if (framePath) {
        frameImage.src = framePath;
        frameImage.onload = function () {
            mainCtx.drawImage(frameImage, 0, 0, mainCanvas.width, mainCanvas.height);
            drawPhotosAndText(); // Pastikan foto & teks tetap digambar setelah frame diterapkan
        };
    } else {
        // Jika tidak ada frame, langsung set warna latar belakang
        mainCtx.fillStyle = frameSelect.value === "spotify" ? getSpotifyGradient() : bgSelect.value;
        mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        drawPhotosAndText();
    }
}


function getFramePath(frame) {
    const framePaths = {
        arcade: "image/arcade.jpg",
        arcade2: "image/arcade-2.png",
        space: "image/space.jpg"
    };
    return framePaths[frame] || ""; // Mengembalikan path gambar atau string kosong jika tidak ditemukan
}
function getSpotifyGradient() {
    let gradient = mainCtx.createLinearGradient(0, 0, 0, mainCanvas.height);
    gradient.addColorStop(0, "#000000");
    gradient.addColorStop(0.5, "#1DB954");
    gradient.addColorStop(1, "#000000");
    return gradient;
}

function drawPhotosAndText() {
    photos.forEach((photo, index) => {
        let position = getGridPosition(index);
        mainCtx.drawImage(photo, position.x, position.y);
    });

    if (frameSelect.value === "spotify") {
        addSpotifyUI();
        addCopyrightTextToSpotify();
    } else {
        addCopyrightText();
    }
}

function addSpotifyUI() {
    let isSmall = gridSelect.value === "1x4"; // Periksa apakah mode 1x4

    // Ukuran font judul lagu & artis
    let titleFontSize = isSmall ? "16px" : "22px";
    let artistFontSize = isSmall ? "12px" : "16px";

    mainCtx.font = `bold ${titleFontSize} Arial`;
    mainCtx.fillStyle = "white";
    mainCtx.textAlign = "left";
    mainCtx.fillText("Somebody Pleasure's", 20, mainCanvas.height - 140);

    mainCtx.font = `${artistFontSize} Arial`;
    mainCtx.fillStyle = "#B3B3B3";
    mainCtx.fillText("Aziz Hendra", 20, mainCanvas.height - 115);

    // Progress Bar
    const progressX = 20;
    const progressY = mainCanvas.height - 80;
    const progressWidth = mainCanvas.width - 45;
    const progressHeight = isSmall ? 4 : 6; // Progress bar lebih tipis jika kecil

    mainCtx.fillStyle = "#5E5E5E";
    mainCtx.fillRect(progressX, progressY, progressWidth, progressHeight);
    mainCtx.fillStyle = "#FFF";
    const currentProgress = progressWidth * 0.6;
    mainCtx.fillRect(progressX, progressY, currentProgress, progressHeight);

    // Ukuran font waktu
    let timeFontSize = isSmall ? "12px" : "14px";
    mainCtx.font = `${timeFontSize} Arial`;
    mainCtx.fillStyle = "#FFF";
    mainCtx.fillText("1:23", progressX, progressY - 5);
    mainCtx.fillText("3:54", progressX + progressWidth - 30, progressY - 5);

    // Posisi ikon di tengah progress bar
    const centerX = mainCanvas.width / 2;
    
    let iconSize = isSmall ? "16px" : "26px"; // Ukuran ikon lebih kecil
    let spacing = isSmall ? 30 : 60; // Jarak ikon lebih rapat

    mainCtx.font = `900 ${iconSize} 'Font Awesome 6 Free'`;
    mainCtx.textAlign = "center";

    // Ikon Shuffle & Repeat Warna Hijau
    mainCtx.fillStyle = "#1DB954";
    let iconSpacing = isSmall ? 80 : 225; // Jarak ikon shuffle & repeat
    mainCtx.fillText("\uf074", centerX - iconSpacing, mainCanvas.height - 40); // Shuffle
    mainCtx.fillText("\uf01e", centerX + iconSpacing, mainCanvas.height - 40); // Repeat

    // Ikon lainnya tetap putih
    mainCtx.fillStyle = "#FFF";
    mainCtx.fillText("\uf048", centerX - spacing, mainCanvas.height - 40);  // Previous
    mainCtx.fillText("\uf144", centerX, mainCanvas.height - 40);            // Play/Pause
    mainCtx.fillText("\uf051", centerX + spacing, mainCanvas.height - 40);  // Next
}

frameSelect.addEventListener('change', () => {
    if (frameSelect.value !== "none") {
        bgSelect.value = ""; // Hapus background saat memilih frame
    }
    setCanvasSize();
    redrawCanvas();
});

captureButton.addEventListener('click', () => {
    if (photos.length >= 4) {
        Swal.fire("Maksimal 4 foto!", "Silakan hapus foto sebelum menambah yang baru.", "warning");
        return;
    }

    let tempCanvas = document.createElement("canvas");
    let videoWidth = video.videoWidth;
    let videoHeight = video.videoHeight;

    let portraitWidth = videoHeight * 3 / 4;
    let portraitHeight = videoHeight;
    let startX = (videoWidth - portraitWidth) / 2;

    tempCanvas.width = 230;
    tempCanvas.height = 320;
    let tempCtx = tempCanvas.getContext("2d");

    // Set default background ke putih jika tidak dipilih
    tempCtx.fillStyle = bgSelect.value ? bgSelect.value : "white";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Balik hasil capture agar tidak mirror
    tempCtx.save();
    tempCtx.translate(tempCanvas.width, 0);
    tempCtx.scale(-1, 1);
    tempCtx.drawImage(
        video,
        startX, 0, portraitWidth, portraitHeight,  // Sumber (video)
        0, 0, tempCanvas.width, tempCanvas.height  // Target di canvas
    );
    tempCtx.restore();

    photos.push(tempCanvas);
    redrawCanvas();
});


resetButton.addEventListener('click', () => {
    if (photos.length === 0) {
        Swal.fire("Tidak ada foto untuk dihapus!", "", "info");
        return;
    }

    Swal.fire({
        title: "Hapus Foto Terakhir?",
        text: "Foto terakhir yang diambil akan dihapus.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal"
    }).then((result) => {
        if (result.isConfirmed) {
            photos.pop(); // Hapus foto terakhir dari array
            redrawCanvas(); // Gambar ulang canvas tanpa foto yang dihapus
            Swal.fire("Dihapus!", "Foto terakhir telah dihapus.", "success");
        }
    });
});

printButton.addEventListener('click', () => {
    if (photos.length === 0) {
        Swal.fire("Tidak ada foto untuk dicetak!", "", "info");
        return;
    }

    // Konversi canvas ke data URL (PNG)
    const imageData = mainCanvas.toDataURL("image/png"); // Bisa diganti "image/jpeg"

    // Buat elemen <a> untuk mengunduh gambar
    const downloadLink = document.createElement("a");
    downloadLink.href = imageData;
    downloadLink.download = `bynnbooth_${Date.now()}.png`; // Nama file unik

    // Klik link secara otomatis untuk memulai unduhan
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    Swal.fire("Gambar telah disiapkan!", "Gambar akan otomatis terunduh.", "success");
});

gridSelect.addEventListener('change', () => {
    setCanvasSize();
    updateCanvasScale(); // Tambahkan ini
    redrawCanvas();
});

bgSelect.addEventListener('change', () => {
    if (bgSelect.value !== "white") {
        frameSelect.value = "none"; // Hapus frame jika memilih background
    }else {
        frameSelect.value = "none"; // Hapus frame jika memilih background lain
    }
    setCanvasSize();
    redrawCanvas();

    // Aktifkan ulang kamera jika sebelumnya mati
    if (!videoStream) {
        startCamera();
    }
});

function updateCanvasScale() {
    const container = document.getElementById('print-area');

    // Reset class sebelumnya
    container.classList.remove("grid-2x2", "grid-1x4");

    // Tambahkan class baru sesuai pilihan grid
    if (gridSelect.value === "2x2") {
        container.classList.add("grid-2x2");
    } else {
        container.classList.add("grid-1x4");
    }

    // Pastikan canvas tetap di tengah dengan transformasi
    mainCanvas.style.margin = "auto";
}

setCanvasSize();
// Jalankan sekali saat halaman dimuat
updateCanvasScale();
