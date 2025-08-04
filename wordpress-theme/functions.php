<?php
/**
 * Tema WordPress com integração React para Blog Libras
 */

// Enqueue React app
function enqueue_libras_blog_assets() {
    // Build do React (após npm run build)
    wp_enqueue_script(
        'libras-blog',
        get_template_directory_uri() . '/dist/main.js',
        array(),
        '1.0.0',
        true
    );
    
    wp_enqueue_style(
        'libras-blog-styles',
        get_template_directory_uri() . '/dist/main.css',
        array(),
        '1.0.0'
    );
    
    // Passar dados do WordPress para o React
    wp_localize_script('libras-blog', 'wpLibrasData', array(
        'apiUrl' => home_url('/wp-json/wp/v2/'),
        'nonce' => wp_create_nonce('wp_rest'),
        'themeUrl' => get_template_directory_uri(),
        'currentUser' => array(
            'id' => get_current_user_id(),
            'name' => wp_get_current_user()->display_name,
            'email' => wp_get_current_user()->user_email
        )
    ));
}
add_action('wp_enqueue_scripts', 'enqueue_libras_blog_assets');

// Adicionar suporte a recursos
function libras_theme_setup() {
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('title-tag');
    
    // Registrar menus
    register_nav_menus(array(
        'primary' => 'Menu Principal',
        'footer' => 'Menu Rodapé'
    ));
}
add_action('after_setup_theme', 'libras_theme_setup');

// Habilitar CORS para API
function add_cors_http_header(){
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('init','add_cors_http_header');
?>
