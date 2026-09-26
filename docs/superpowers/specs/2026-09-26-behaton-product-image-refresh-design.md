# Behaton Product Image Refresh Design

## Goal

Replace the public online catalog's product photography with a consistent, realistic studio set that helps buyers identify each orderable behaton product. Every identified product receives two new images: a main single-product image and a grouped detail image.

## Scope

- Process only behaton product images used by catalog cards and product detail pages.
- Do not alter project, installation, hero, yard, vehicle, or other documentary photography.
- Cover the 17 properly identified published behaton products first.
- Keep the malformed published records named `1` and `2` at the end of the catalog. Do not generate their four images until the products are identified from a reliable source.
- Preserve existing source photographs outside the public display path as references and rollback assets.

## Visual Standard

All outputs use a square canvas, a pure white `#FFFFFF` seamless background, consistent camera height, consistent product scale and margin, soft neutral studio lighting, and a subtle realistic contact shadow. Images contain no text, logos, watermarks, people, pallets, straps, dirt, gravel, vehicles, plants, or decorative props.

The concrete must remain photographic rather than glossy, smooth, plastic, or CGI-like. The output must preserve the source product's actual geometry, edge profile, thickness, openings, grooves, joints, surface texture, aggregate, and color variation. Image generation must not invent sizes, colors, pieces, openings, or product variants.

## Image Set Per Product

### Main image

- Show one isolated product at a consistent three-quarter angle.
- Make the top surface and thickness readable.
- Use this image on the catalog listing card and as the primary product detail image.
- For products sold only as a multi-format system, such as Combo and City Park, show one complete representative set of the real component formats rather than inventing a single piece.

### Group image

- Show three to five real pieces in a tidy, believable arrangement at the same studio angle and lighting.
- Make joints, repeating geometry, edge profile, and stacking behavior readable.
- Use this as the second image in the product detail gallery.
- For a multi-format system, show only the real component combination established by the reference image and product specification.

## Production Workflow

1. Build a manifest linking each published product ID and slug to its best original source image, output filenames, dimensions, and review status.
2. Use `PLOCA CLASSIC 30x30 d=6 cm` as the pilot because its source clearly shows the top surface, edge, thickness, and concrete texture.
3. Generate the pilot main image from the original reference.
4. Generate the pilot group image from the same reference and locked visual standard.
5. Review the two pilot images for geometry, material realism, color, background, composition, and consistency.
6. Once the pilot passes, process the remaining 16 identified products in small batches. Review every output before integration; regenerate only failed images.
7. Optimize approved masters for the web while retaining full-resolution generated masters separately.
8. Map the main image to the catalog card and primary detail view, and map the group image as the second detail-gallery item.
9. Place records `1` and `2` last. Generate their images only after their identity and dimensions are confirmed.

## File and Data Design

- Store generated master files in a dedicated working directory under `katalog/_radni/` so they are not accidentally served to users.
- Store approved web assets under `frontend/public/img/behaton/products/generated/`.
- Use deterministic filenames based on the product slug, ending in `-main` and `-group`.
- Extend `frontend/lib/behaton-media.ts` so each identified product has one listing/detail override and a two-image gallery ordered main then group.
- Keep image mapping explicit by product slug. Do not infer mappings from display names because several products share a name but differ by thickness.

## Quality Gate

An image passes only when all of the following are true:

- product silhouette and proportions match the reference;
- thickness, openings, grooves, profiles, and component count are unchanged;
- concrete color and texture remain plausible and reference-faithful;
- background is visually pure white and contains no accidental objects;
- contact shadow is subtle and physically plausible;
- the product is fully inside the frame with consistent margins;
- no generated text, logos, watermarks, straps, pallets, or artifacts appear;
- main and group images clearly depict the same product variant.

Any output that changes functional geometry is rejected rather than repaired through CSS or accepted as a cosmetic approximation.

## Integration and Verification

- Verify every identified published product resolves to an existing main and group file.
- Verify listing cards use only the main image.
- Verify product detail pages show the main image first and the group image second without old duplicate photos preceding them.
- Verify records `1` and `2` sort last.
- Run frontend lint and production build.
- Manually inspect the desktop and mobile catalog grid and representative detail pages, including a simple slab, a multi-format product, and Raster with openings.
- Confirm no non-product photographs were changed.

## Rollback

Existing source assets and API URLs remain untouched. Reverting the explicit media overrides restores the previous public presentation without data loss.
