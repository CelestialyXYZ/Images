const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

// Replace with the path to your parent folder containing the images
const inputDir = "./assets/";
// Replace with the path to your desired output folder
const outputDir = "./images/";
// Array of desired dimensions
const dimensions = [
  { width: 500, height: 300 },
  { width: 1280, height: 900 },
  { width: 1920, height: 1280 },
  // Add more dimensions as needed
];

// Function to ensure directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Function to process images in a given directory
const processImagesInDir = async (dir, outputBase) => {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const relativePath = path.relative(inputDir, itemPath);
    const outputItemBase = path.join(outputBase, path.dirname(relativePath));

    if (fs.statSync(itemPath).isDirectory()) {
      // Recursively process the directory
      await processImagesInDir(itemPath, outputBase);
    } else if (/\.(jpe?g|png|tiff?|JPE?G|PNG|TIFF?)$/i.test(itemPath)) {
      console.log(`Processing ${itemPath}`);

      for (const { width, height } of dimensions) {
        try {
          const dimensionDir = path.join(outputItemBase, `${width}x${height}`);
          ensureDirExists(dimensionDir);

          const outputItemPath = path.join(
            dimensionDir,
            path.basename(itemPath, path.extname(itemPath)) + ".jpg"
          );

          // Check if the image has already been processed
          if (fs.existsSync(outputItemPath)) {
            console.log(`Skipping ${itemPath}, already processed.`);
            continue;
          }

          // If the item is an image, process it
          const image = await Jimp.read(itemPath);

          const { bitmap } = image;

          let shouldRotate =
            (bitmap.width / bitmap.height > 1 && width / height < 1) ||
            (bitmap.width / bitmap.height < 1 && width / height > 1)
              ? true
              : false;

          const processedImage = shouldRotate
            ? image.clone().rotate(90)
            : image.clone();
          await processedImage
            .cover(width, height)
            .quality(80)
            .writeAsync(outputItemPath);
          console.log(
            `Processed ${itemPath} -> ${outputItemPath} with${
              shouldRotate ? " rotation" : "out rotation"
            }`
          );
        } catch (error) {
          console.error(
            `Error processing ${itemPath} at ${width}x${height}:`,
            error
          );
          // Continue to the next dimension or image
        }
      }
    }
  }
};

// Main function to start processing
const main = async () => {
  ensureDirExists(outputDir);
  await processImagesInDir(inputDir, outputDir);
};

main().catch((err) => console.error(err));
