const bytesPerPixel = 4;

const multiplyBasisFunction = (
  pixels,
  width,
  height,
  basisFunction
) => {
  let r = 0;
  let g = 0;
  let b = 0;
  const bytesPerRow = width * bytesPerPixel;

  for (let x = 0; x < width; x++) {
    const bytesPerPixelX = bytesPerPixel * x;

    for (let y = 0; y < height; y++) {
      const basePixelIndex = bytesPerPixelX + y * bytesPerRow;
      const basis = basisFunction(x, y);
      r +=
        basis * sRGBToLinear(pixels[basePixelIndex]);
      g +=
        basis * sRGBToLinear(pixels[basePixelIndex + 1]);
      b +=
        basis * sRGBToLinear(pixels[basePixelIndex + 2]);
    }
  }

  let scale = 1 / (width * height);

  return [r * scale, g * scale, b * scale];
};

const encodeDC = (value) => {
  const roundedR = linearTosRGB(value[0]);
  const roundedG = linearTosRGB(value[1]);
  const roundedB = linearTosRGB(value[2]);
  return (roundedR << 16) + (roundedG << 8) + roundedB;
};

const encodeAC = (value, maximumValue) => {
  let quantR = Math.floor(
    Math.max(
      0,
      Math.min(18, Math.floor(signPow(value[0] / maximumValue, 0.5) * 9 + 9.5))
    )
  );
  let quantG = Math.floor(
    Math.max(
      0,
      Math.min(18, Math.floor(signPow(value[1] / maximumValue, 0.5) * 9 + 9.5))
    )
  );
  let quantB = Math.floor(
    Math.max(
      0,
      Math.min(18, Math.floor(signPow(value[2] / maximumValue, 0.5) * 9 + 9.5))
    )
  );

  return quantR * 19 * 19 + quantG * 19 + quantB;
};

const encode = self.encode = (
  pixels,
  width,
  height,
  componentX,
  componentY
) => {
  if (componentX < 1 || componentX > 9 || componentY < 1 || componentY > 9) {
    throw new ValidationError("BlurHash must have between 1 and 9 components");
  }
  if (width * height * 4 !== pixels.length) {
    throw new ValidationError("Width and height must match the pixels array");
  }

  let factors = [];
  for (let y = 0; y < componentY; y++) {
    for (let x = 0; x < componentX; x++) {
      const normalisation = x == 0 && y == 0 ? 1 : 2;
      const factor = multiplyBasisFunction(
        pixels,
        width,
        height,
        (i, j) =>
          normalisation *
          Math.cos((Math.PI * x * i) / width) *
          Math.cos((Math.PI * y * j) / height)
      );
      factors.push(factor);
    }
  }

  const dc = factors[0];
  const ac = factors.slice(1);

  let hash = "";

  let sizeFlag = componentX - 1 + (componentY - 1) * 9;
  hash += encode83(sizeFlag, 1);

  let maximumValue;
  if (ac.length > 0) {
    let actualMaximumValue = Math.max(...ac.map((val) => Math.max(...val)));
    let quantisedMaximumValue = Math.floor(
      Math.max(0, Math.min(82, Math.floor(actualMaximumValue * 166 - 0.5)))
    );
    maximumValue = (quantisedMaximumValue + 1) / 166;
    hash += encode83(quantisedMaximumValue, 1);
  } else {
    maximumValue = 1;
    hash += encode83(0, 1);
  }

  hash += encode83(encodeDC(dc), 4);

  ac.forEach((factor) => {
    hash += encode83(encodeAC(factor, maximumValue), 2);
  });

  return hash;
};
