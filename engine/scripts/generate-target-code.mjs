import fs from "fs";
import path from "path";

/**
 * Step 3: WordPress Theme Environment Scaffolder
 * 
 * Sets up the core WordPress classic theme environment, modular helper architecture,
 * and dynamic template routing in `dist-client/`.
 * 
 * Note: Individual UI component blocks and ACF JSON schemas are authored directly
 * by the specialized AI Architect Agent (wordpress-php-architect) using its semantic
 * intelligence, vision metadata, and approved HTML components.
 */

const rootDir = process.cwd();
const stateFile = path.join(rootDir, ".workflow-state.json");

if (!fs.existsSync(stateFile)) {
  console.error("❌ .workflow-state.json not found. Run 'npm run client:init' first.");
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
const targetPlatform = state.client?.targetPlatform || "wordpress-php";
const clientName = state.client?.name || "Skin Clinic Luxury DTC";
const clientSlug = state.client?.slug || "skin-clinic";
const hasAcfProLicense = Boolean(state.client?.hasAcfProLicense);

console.log("\n=======================================================");
console.log("   STEP 3: WORDPRESS THEME ENVIRONMENT SCAFFOLDER     ");
console.log("=======================================================");
console.log(`[Target Platform] : \x1b[36m${targetPlatform}\x1b[0m`);
console.log(`[Client Name]     : \x1b[32m${clientName}\x1b[0m`);
console.log(`[ACF Pro License] : \x1b[33m${hasAcfProLicense ? "Active (Commercial)" : "None (Free ACF / Secure Custom Fields / OpenFields Fallback)"}\x1b[0m\n`);

if (targetPlatform === "wordpress-php") {
  scaffoldWordPressEnvironment();
} else {
  console.log(`[Step 3] Platform '${targetPlatform}' environment scaffolder invoked.`);
}

export function scaffoldWordPressEnvironment() {
  const outDir = path.join(rootDir, "dist-client");
  const templatePartsDir = path.join(outDir, "template-parts/blocks");
  const incDir = path.join(outDir, "inc");
  const acfDir = path.join(outDir, "acf-json");

  fs.mkdirSync(path.join(templatePartsDir, "shared"), { recursive: true });
  fs.mkdirSync(path.join(templatePartsDir, "unique"), { recursive: true });
  fs.mkdirSync(incDir, { recursive: true });
  fs.mkdirSync(acfDir, { recursive: true });

  console.log("[Scaffolder] 1/4 Synthesizing WordPress style.css...");
  const styleCss = `/*
Theme Name: ${clientName}
Theme URI: https://skinclinic.example.com
Author: Universal CMS & Headless Agency Workflow
Author URI: https://example.com
Description: Production-ready luxury clinical skincare e-commerce theme for WordPress, ACF Pro / Secure Custom Fields, and WooCommerce.
Version: 1.0.0
Requires at least: 6.0
Tested up to: 6.6
Requires PHP: 8.1
Text Domain: ${clientSlug}
*/
`;
  fs.writeFileSync(path.join(outDir, "style.css"), styleCss, "utf-8");

  console.log("[Scaffolder] 2/4 Synthesizing modular helpers in inc/...");

  // inc/field-helpers.php
  const fieldHelpersPhp = `<?php
/**
 * Field Accessor & Multi-Tier Custom Fields Abstraction Helpers
 *
 * Provides a universal abstraction layer that works seamlessly across:
 * 1. ACF Pro (Advanced Custom Fields Pro with native repeaters)
 * 2. Free ACF / Secure Custom Fields (SCF) / OpenFields (single fields active, repeater fallback)
 * 3. Vanilla WordPress core (post meta, theme options, and design system defaults)
 *
 * @package SkinClinic
 * @version 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Safely retrieve a scalar custom field value.
 *
 * @param string      $field_key The custom field key or meta key name.
 * @param int|string  $post_id   The post ID, or 'option' for sitewide settings. Defaults to current post.
 * @param mixed       $default   Fallback default value if field is empty.
 * @return mixed The field value or default fallback.
 */
if (!function_exists('app_get_field')) {
    function app_get_field($field_key, $post_id = null, $default = '') {
        $post_id = ($post_id === null) ? get_the_ID() : $post_id;

        // 1. Check if ACF Pro, Free ACF, or Secure Custom Fields (SCF) is active
        if (function_exists('get_field')) {
            $val = get_field($field_key, $post_id);
            if (!empty($val) || $val === '0' || $val === 0) {
                return $val;
            }
        }

        // 2. Check WordPress global options if 'option' scope is requested
        if ($post_id === 'option' || $post_id === 'options') {
            $val = get_option($field_key);
            if (!empty($val) || $val === '0' || $val === 0) {
                return $val;
            }
            return $default;
        }

        // 3. Fallback to native WordPress post_meta
        if ($post_id && is_numeric($post_id)) {
            $val = get_post_meta($post_id, $field_key, true);
            if (!empty($val) || $val === '0' || $val === 0) {
                return $val;
            }
        }

        // 4. Return default fallback
        return $default;
    }
}

/**
 * Safely retrieve repeater rows across ACF Pro, Free ACF/SCF, and default visual fallbacks.
 *
 * Guarantees that repeating collections render with 100% design fidelity even on a fresh
 * WordPress install without an ACF Pro license or before content is entered.
 *
 * @param string      $repeater_key Field name for the repeater.
 * @param array       $default_rows Pre-populated array of row data matching approved visual mockup.
 * @param int|null    $post_id      The post ID. Defaults to current post.
 * @return array Array of associative row items.
 */
if (!function_exists('app_get_repeater_rows')) {
    function app_get_repeater_rows($repeater_key, $default_rows = [], $post_id = null) {
        $post_id = ($post_id === null) ? get_the_ID() : $post_id;
        $rows = [];

        // 1. If ACF Pro have_rows() is active, query native repeater rows
        if (function_exists('have_rows') && have_rows($repeater_key, $post_id)) {
            while (have_rows($repeater_key, $post_id)) {
                the_row();
                $row_data = get_row(true);
                if (is_array($row_data) && !empty($row_data)) {
                    $rows[] = $row_data;
                }
            }
            if (!empty($rows)) {
                return $rows;
            }
        }

        // 2. Check native post_meta (handles Free ACF / SCF serialized arrays or JSON)
        if ($post_id && is_numeric($post_id)) {
            $meta_rows = get_post_meta($post_id, $repeater_key, true);
            if (!empty($meta_rows)) {
                if (is_string($meta_rows)) {
                    $decoded = json_decode($meta_rows, true);
                    if (is_array($decoded) && !empty($decoded)) {
                        return $decoded;
                    }
                } elseif (is_array($meta_rows) && !empty($meta_rows)) {
                    return $meta_rows;
                }
            }
        }

        // 3. Fallback: Return modular visual default data matching the approved design mockup
        return $default_rows;
    }
}

/**
 * Safely resolve an image field to an absolute URL string.
 *
 * @param mixed  $image_field  The raw image field value.
 * @param string $fallback_url Fallback image URL if empty.
 * @param string $size         WordPress image size. Defaults to 'full'.
 * @return string Clean image URL.
 */
if (!function_exists('app_get_image_url')) {
    function app_get_image_url($image_field, $fallback_url = '', $size = 'full') {
        if (empty($image_field)) {
            return $fallback_url;
        }
        if (is_numeric($image_field)) {
            $src = wp_get_attachment_image_url((int)$image_field, $size);
            return $src ? $src : $fallback_url;
        }
        if (is_array($image_field) && !empty($image_field['url'])) {
            return $image_field['url'];
        }
        if (is_string($image_field) && !empty($image_field)) {
            return $image_field;
        }
        return $fallback_url;
    }
}
`;
  fs.writeFileSync(path.join(incDir, "field-helpers.php"), fieldHelpersPhp, "utf-8");

  // inc/theme-setup.php
  const themeSetupPhp = `<?php
/**
 * Theme Setup, Asset Enqueuing & Admin Environment Notifications
 *
 * @package SkinClinic
 * @version 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

function skin_clinic_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('woocommerce');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
    register_nav_menus(array(
        'primary-menu' => __('Primary Header Navigation', 'skin-clinic'),
        'footer-menu'  => __('Footer Navigation', 'skin-clinic'),
    ));
}
add_action('after_setup_theme', 'skin_clinic_setup');

function skin_clinic_scripts() {
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300..800&family=Inter:wght@300..900&display=swap', array(), null);
    wp_enqueue_script('tailwindcss', 'https://cdn.tailwindcss.com', array(), null, false);
    wp_enqueue_style('theme-style', get_stylesheet_uri(), array(), '1.0.0');
}
add_action('wp_enqueue_scripts', 'skin_clinic_scripts');

add_filter('acf/settings/save_json', function($path) {
    return get_stylesheet_directory() . '/acf-json';
});
add_filter('acf/settings/load_json', function($paths) {
    $paths[] = get_stylesheet_directory() . '/acf-json';
    return $paths;
});

function skin_clinic_admin_license_notice() {
    if (!current_user_can('manage_options')) {
        return;
    }
    if (!function_exists('have_rows')) {
        echo '<div class="notice notice-info is-dismissible"><p>';
        echo '<strong>' . esc_html__('Skin Clinic Theme Status: ', 'skin-clinic') . '</strong>';
        echo esc_html__('Running in Universal Multi-Tier Fallback Mode (Free ACF / Secure Custom Fields / OpenFields active). All template parts, repeaters, and design tokens render dynamically with built-in visual fallbacks.', 'skin-clinic');
        echo '</p></div>';
    }
}
add_action('admin_notices', 'skin_clinic_admin_license_notice');
`;
  fs.writeFileSync(path.join(incDir, "theme-setup.php"), themeSetupPhp, "utf-8");

  // inc/template-tags.php
  const templateTagsPhp = `<?php
/**
 * Custom Template Tags & View Helper Utilities
 *
 * @package SkinClinic
 * @version 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

function skin_clinic_get_cart_count() {
    if (function_exists('WC') && WC()->cart) {
        return WC()->cart->get_cart_contents_count();
    }
    return 0;
}
`;
  fs.writeFileSync(path.join(incDir, "template-tags.php"), templateTagsPhp, "utf-8");

  console.log("[Scaffolder] 3/4 Synthesizing modular functions.php bootstrap...");
  const functionsPhp = `<?php
/**
 * Theme Bootstrap & Core Initialization
 *
 * @package SkinClinic
 * @version 1.0.0
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

require_once get_template_directory() . '/inc/field-helpers.php';
require_once get_template_directory() . '/inc/theme-setup.php';
require_once get_template_directory() . '/inc/template-tags.php';
`;
  fs.writeFileSync(path.join(outDir, "functions.php"), functionsPhp, "utf-8");

  console.log("[Scaffolder] 4/4 Synthesizing template routing wrappers (index.php, header.php, footer.php)...");

  // index.php
  const indexPhp = `<?php
/**
 * The Main Template File
 * Dynamically assembles modular template parts
 *
 * @package SkinClinic
 */

get_header();
?>

<main id="primary" class="site-main flex-1">
  <?php
  if (is_front_page() || is_home()) {
    get_template_part('template-parts/blocks/unique/hero-editorial');
    get_template_part('template-parts/blocks/unique/best-sellers-shelf');
    get_template_part('template-parts/blocks/unique/category-spotlight');
    get_template_part('template-parts/blocks/unique/featured-products-shelf');
    get_template_part('template-parts/blocks/unique/sheet-mask-feature');
    get_template_part('template-parts/blocks/unique/journal-teaser');
    get_template_part('template-parts/blocks/unique/dual-promo-cards');
    get_template_part('template-parts/blocks/unique/oceanic-banner');
    get_template_part('template-parts/blocks/unique/testimonials-slider');
    get_template_part('template-parts/blocks/shared/instagram-gallery');
    get_template_part('template-parts/blocks/shared/newsletter-banner');
  } elseif (is_singular('product')) {
    get_template_part('template-parts/blocks/unique/pdp-buy-box');
    get_template_part('template-parts/blocks/unique/daily-ritual-split');
    get_template_part('template-parts/blocks/unique/active-ingredients-cards');
    get_template_part('template-parts/blocks/unique/pdp-accordion-specs');
    get_template_part('template-parts/blocks/unique/cross-sell-shelf');
    get_template_part('template-parts/blocks/unique/testimonials-slider');
    get_template_part('template-parts/blocks/shared/instagram-gallery');
    get_template_part('template-parts/blocks/shared/newsletter-banner');
  } elseif (is_post_type_archive('product') || is_page('shop')) {
    get_template_part('template-parts/blocks/unique/plp-faceted-catalog');
    get_template_part('template-parts/blocks/shared/instagram-gallery');
    get_template_part('template-parts/blocks/shared/newsletter-banner');
  } elseif (is_page('about')) {
    get_template_part('template-parts/blocks/unique/about-manifesto');
    get_template_part('template-parts/blocks/unique/split-narrative');
    get_template_part('template-parts/blocks/unique/testimonials-slider');
    get_template_part('template-parts/blocks/shared/newsletter-banner');
  } elseif (is_page('journal') || is_home()) {
    get_template_part('template-parts/blocks/unique/journal-grid');
    get_template_part('template-parts/blocks/shared/newsletter-banner');
  } elseif (is_single()) {
    get_template_part('template-parts/blocks/unique/article-prose');
    get_template_part('template-parts/blocks/shared/newsletter-banner');
  } elseif (is_page('cart')) {
    get_template_part('template-parts/blocks/unique/cart-table');
    get_template_part('template-parts/blocks/unique/cross-sell-shelf');
    get_template_part('template-parts/blocks/shared/instagram-gallery');
  } elseif (is_page('checkout')) {
    get_template_part('template-parts/blocks/unique/checkout-flow');
  } else {
    the_content();
  }
  ?>
</main>

<?php
get_footer();
`;
  fs.writeFileSync(path.join(outDir, "index.php"), indexPhp, "utf-8");

  // header.php
  const headerPhp = `<!DOCTYPE html>
<html <?php language_attributes(); ?> class="scroll-smooth">
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; letter-spacing: -0.04em; color: #000000; background-color: #FFFFFF; }
    h1, h2, h3, h4, h5, h6, .font-heading { font-family: 'Inter Tight', -apple-system, sans-serif; letter-spacing: -0.06em; }
  </style>
  <?php wp_head(); ?>
</head>
<body <?php body_class('bg-white text-black antialiased min-h-screen flex flex-col selection:bg-black selection:text-white'); ?>>
<?php wp_body_open(); ?>
<?php get_template_part('template-parts/blocks/shared/announcement-bar'); ?>
<?php get_template_part('template-parts/blocks/shared/header-nav'); ?>
`;
  fs.writeFileSync(path.join(outDir, "header.php"), headerPhp, "utf-8");

  // footer.php
  const footerPhp = `<?php get_template_part('template-parts/blocks/shared/footer-global'); ?>
<?php wp_footer(); ?>
</body>
</html>
`;
  fs.writeFileSync(path.join(outDir, "footer.php"), footerPhp, "utf-8");

  console.log("\n✔ Scaffolding complete. Environment ready for AI Agent Block Synthesis.\n");
}
