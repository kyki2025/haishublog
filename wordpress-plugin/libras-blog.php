<?php
/**
 * Plugin Name: Blog Libras React
 * Description: Blog educacional de Libras desenvolvido em React
 * Version: 1.0.0
 * Author: Seu Nome
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

class LibrasBlogPlugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('libras_blog', array($this, 'render_shortcode'));
        add_action('rest_api_init', array($this, 'register_api_routes'));
    }
    
    public function init() {
        // Registrar post type customizado para artigos de Libras
        register_post_type('libras_artigo', array(
            'labels' => array(
                'name' => 'Artigos Libras',
                'singular_name' => 'Artigo Libras'
            ),
            'public' => true,
            'has_archive' => true,
            'show_in_rest' => true,
            'supports' => array('title', 'editor', 'thumbnail', 'excerpt', 'comments'),
            'menu_icon' => 'dashicons-universal-access'
        ));
        
        // Registrar taxonomias
        register_taxonomy('categoria_libras', 'libras_artigo', array(
            'labels' => array(
                'name' => 'Categorias Libras',
                'singular_name' => 'Categoria Libras'
            ),
            'hierarchical' => true,
            'show_in_rest' => true
        ));
        
        register_taxonomy('tag_libras', 'libras_artigo', array(
            'labels' => array(
                'name' => 'Tags Libras',
                'singular_name' => 'Tag Libras'
            ),
            'hierarchical' => false,
            'show_in_rest' => true
        ));
    }
    
    public function enqueue_scripts() {
        // Carregar assets do React build
        wp_enqueue_script(
            'libras-blog-js',
            plugin_dir_url(__FILE__) . 'build/static/js/main.js',
            array(),
            '1.0.0',
            true
        );
        
        wp_enqueue_style(
            'libras-blog-css',
            plugin_dir_url(__FILE__) . 'build/static/css/main.css',
            array(),
            '1.0.0'
        );
        
        // Localizar script com dados do WordPress
        wp_localize_script('libras-blog-js', 'wpData', array(
            'apiUrl' => rest_url('wp/v2/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'currentUser' => wp_get_current_user()
        ));
    }
    
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'height' => '800px',
            'page' => 'home'
        ), $atts);
        
        return '<div id="libras-blog-root" style="height: ' . $atts['height'] . '" data-page="' . $atts['page'] . '"></div>';
    }
    
    public function register_api_routes() {
        // Rota customizada para estatísticas
        register_rest_route('libras/v1', '/stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_blog_stats')
        ));
    }
    
    public function get_blog_stats() {
        $posts = wp_count_posts('libras_artigo');
        $comments = wp_count_comments();
        
        return array(
            'total_articles' => $posts->publish,
            'total_comments' => $comments->approved,
            'categories' => wp_count_terms('categoria_libras'),
            'tags' => wp_count_terms('tag_libras')
        );
    }
}

new LibrasBlogPlugin();

// Adicionar campos customizados
add_action('add_meta_boxes', 'add_libras_meta_boxes');
function add_libras_meta_boxes() {
    add_meta_box(
        'libras_article_meta',
        'Configurações do Artigo Libras',
        'libras_article_meta_callback',
        'libras_artigo'
    );
}

function libras_article_meta_callback($post) {
    wp_nonce_field('libras_meta_box', 'libras_meta_box_nonce');
    
    $featured = get_post_meta($post->ID, '_libras_featured', true);
    $read_time = get_post_meta($post->ID, '_libras_read_time', true);
    $video_url = get_post_meta($post->ID, '_libras_video_url', true);
    
    echo '<table class="form-table">';
    echo '<tr><th><label for="libras_featured">Artigo em Destaque:</label></th>';
    echo '<td><input type="checkbox" id="libras_featured" name="libras_featured" value="1" ' . checked(1, $featured, false) . ' /></td></tr>';
    
    echo '<tr><th><label for="libras_read_time">Tempo de Leitura (min):</label></th>';
    echo '<td><input type="number" id="libras_read_time" name="libras_read_time" value="' . esc_attr($read_time) . '" /></td></tr>';
    
    echo '<tr><th><label for="libras_video_url">URL do Vídeo em Libras:</label></th>';
    echo '<td><input type="url" id="libras_video_url" name="libras_video_url" value="' . esc_attr($video_url) . '" class="regular-text" /></td></tr>';
    echo '</table>';
}

// Salvar campos customizados
add_action('save_post', 'save_libras_meta_box_data');
function save_libras_meta_box_data($post_id) {
    if (!isset($_POST['libras_meta_box_nonce'])) return;
    if (!wp_verify_nonce($_POST['libras_meta_box_nonce'], 'libras_meta_box')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;
    
    if (isset($_POST['libras_featured'])) {
        update_post_meta($post_id, '_libras_featured', 1);
    } else {
        delete_post_meta($post_id, '_libras_featured');
    }
    
    if (isset($_POST['libras_read_time'])) {
        update_post_meta($post_id, '_libras_read_time', sanitize_text_field($_POST['libras_read_time']));
    }
    
    if (isset($_POST['libras_video_url'])) {
        update_post_meta($post_id, '_libras_video_url', esc_url_raw($_POST['libras_video_url']));
    }
}
?>
