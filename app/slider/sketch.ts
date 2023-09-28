import * as PIXI from 'pixi.js';
import gsap from 'gsap';

const imgURLs = ['/imgs/pic1.png', '/imgs/pic2.png', '/imgs/pic3.png',
    '/imgs/pic4.png', '/imgs/pic5.png', '/imgs/pic6.png'];

const loadImages = (paths: string[], whenLoaded: Function) => {
    const imgs: HTMLImageElement[] = [];
    const img0: any[] = [];
    paths.forEach((path: string) => {
        const img = new Image();
        img.onload = () => {
            imgs.push(img);
            img0.push({ path, img });
            if (imgs.length === paths.length) whenLoaded(img0);
        };
        img.src = path;
    })
}

interface IContainer {
    w: number;
    h: number;
}

function calculate(target: IContainer, container: IContainer, cover: boolean = true) {
    var containerW = container.w;
    var containerH = container.h;
    var targetW = target.w;
    var targetH = target.h;

    var rw = containerW / targetW;
    var rh = containerH / targetH;
    var r;

    if (cover) {
        r = (rw > rh) ? rw : rh;
    } else {
        r = (rw < rh) ? rw : rh;
    }

    return {
        left: (containerW - targetW * r) >> 1,
        top: (containerH - targetH * r) >> 1,
        width: targetW * r,
        height: targetH * r,
        scale: r
    };
}

export default class Sketch {
    app: PIXI.Application;
    container: PIXI.Container;
    loadedImgs: any[] = [];
    margin: number;
    width: number;
    height: number;
    wholeWidth: number;
    scroll: number = 0;
    scrollTarget: number = 0;
    thumbs: PIXI.Container[] = [];
    displacementSprite?: PIXI.Sprite;
    displacementFilter?: PIXI.DisplacementFilter;
    direction: number = -1;


    constructor() {
        this.app = new PIXI.Application({
            background: '#1099bb',
            resizeTo: window
        });
        this.container = new PIXI.Container();
        this.margin = 50;
        this.width = (window.innerWidth - 2 * this.margin) / 3;
        this.height = window.innerHeight * 0.8;
        this.wholeWidth = imgURLs.length * (this.width + this.margin);
        this.init();
        this.load();
    }

    init() {
        this.app.stage.addChild(this.container);

    }

    load() {
        loadImages(imgURLs, (imgs: any[]) => {
            this.loadedImgs = imgs;
            this.addObject();
            this.render();
            this.scrollEvent();
            this.addFilter();
        })
    }

    render() {
        this.app.ticker.add(() => {
            this.app.renderer.render(this.container);
            this.direction = this.scroll > 0 ? -1 : 1;
            this.scroll -= (this.scroll - this.scrollTarget) * 0.1;
            this.scroll *= 0.9;
            this.thumbs.forEach(th => {
                th.position.x = this.calcPos(this.scroll, th.position.x);
            })

            this.displacementFilter!.scale.x = Math.abs(this.scroll) * this.direction * 3;
        });
    }

    addObject() {
        this.loadedImgs.forEach((img, i) => {
            const texture = PIXI.Texture.from(img.img);
            const sprite = new PIXI.Sprite(texture);
            const container = new PIXI.Container();
            const spriteContainer = new PIXI.Container();

            const mask = new PIXI.Sprite(PIXI.Texture.WHITE);
            mask.width = this.width;
            mask.height = this.height;

            sprite.mask = mask;

            sprite.anchor.set(0.5);
            sprite.position.set(
                sprite.texture.orig.width / 2,
                sprite.texture.orig.height / 2
            );

            const parent = {
                w: this.width,
                h: this.height,
            };

            const image = {
                w: sprite.texture.orig.width,
                h: sprite.texture.orig.height,
            };

            const cover = calculate(image, parent);

            spriteContainer.position.set(cover.left, cover.top);
            spriteContainer.scale.set(cover.scale, cover.scale);

            container.x = (this.margin + this.width) * i;
            container.y = this.height / 10;

            container.interactive = true;
            container.on('mouseover', this.mouseOn);
            container.on('mouseout', this.mouseOut);

            spriteContainer.addChild(sprite);
            container.addChild(spriteContainer);
            container.addChild(mask);
            this.container.addChild(container);
            this.thumbs.push(container);
        });

    }

    mouseOn(e: any) {
        const el = e.target.children[0].children[0];
        gsap.to(el.scale, {
            duration: 0.5,
            x: 1.1,
            y: 1.1,
        });
    }

    mouseOut(e: any) {
        const el = e.currentTarget.children[0].children[0];
        gsap.to(el.scale, {
            duration: 0.5,
            x: 1,
            y: 1,
        });
    }

    scrollEvent() {
        document.addEventListener('wheel', (e: any) => {
            this.scrollTarget = e.wheelDelta;
        })
    }

    calcPos(scr: number, pos: number) {
        const temp = (scr + pos + this.wholeWidth + this.width + this.margin) % this.wholeWidth - this.width - this.margin;

        return temp;
    }

    addFilter() {
        this.displacementSprite = PIXI.Sprite.from('/imgs/disp.png');
        this.app.stage.addChild(this.displacementSprite);

        const target = {
            w: 256,
            h: 256,
        };

        const parent = {
            w: window.innerWidth,
            h: window.innerHeight,
        }

        const cover = calculate(target, parent);

        this.displacementSprite.position.set(cover.left, cover.top);
        this.displacementSprite.scale.set(cover.scale, cover.scale);

        this.displacementFilter = new PIXI.DisplacementFilter(this.displacementSprite);

        this.displacementFilter.scale.x = 0;
        this.displacementFilter.scale.y = 0;
        this.container.filters = [this.displacementFilter];
    }

}
