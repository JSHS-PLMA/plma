export async function Person(ctx, stageSize) {
    let images = ['/person.png'];
    let loadedImages = {};

    function loadImage() {
        const promiseArray = images.map(function (imgurl) {
            const prom = new Promise(function (resolve, reject) {
                let img = new Image();
                img.onload = function () {
                    loadedImages[imgurl] = img;
                    resolve();
                };
                img.src = imgurl;
            });
            return prom;
        });

        return Promise.all(promiseArray);
    }

    await loadImage();
    const img = loadedImages['/person.png'];

    ctx.drawImage(
        img,
        stageSize.width - 1500 / 2 - 100,
        stageSize.height - 1914 / 2,
        1500 / 2,
        1914 / 2
    );
}
