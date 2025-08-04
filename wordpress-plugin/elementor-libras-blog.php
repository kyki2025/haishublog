<?php
/**
 * Plugin Name: Libras Blog para Elementor
 * Description: Integração do Blog Libras React com Elementor
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) exit;

class ElementorLibrasBlog {
    
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
        add_shortcode('libras_blog', array($this, 'render_shortcode'));
        add_action('elementor/widgets/widgets_registered', array($this, 'register_elementor_widget'));
    }
    
    public function enqueue_assets() {
        // CSS do React build
        wp_enqueue_style(
            'libras-blog-css',
            plugin_dir_url(__FILE__) . 'build/static/css/main.css',
            array(),
            '1.0.0'
        );
        
        // JavaScript do React build
        wp_enqueue_script(
            'libras-blog-js',
            plugin_dir_url(__FILE__) . 'build/static/js/main.js',
            array(),
            '1.0.0',
            true
        );
        
        // Dados para o React
        wp_localize_script('libras-blog-js', 'wpLibrasData', array(
            'apiUrl' => rest_url('wp/v2/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'siteUrl' => home_url(),
            'currentUser' => wp_get_current_user()
        ));
    }
    
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'height' => '800px',
            'page' => 'home',
            'category' => '',
            'limit' => '10'
        ), $atts);
        
        ob_start();
        ?>
        <div id="libras-blog-root" 
             style="min-height: <?php echo esc_attr($atts['height']); ?>;" 
             data-page="<?php echo esc_attr($atts['page']); ?>"
             data-category="<?php echo esc_attr($atts['category']); ?>"
             data-limit="<?php echo esc_attr($atts['limit']); ?>">
            <div class="loading-spinner" style="text-align: center; padding: 50px;">
                <p>Carregando Blog Libras...</p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function register_elementor_widget() {
        require_once plugin_dir_path(__FILE__) . 'elementor-widget.php';
        \Elementor\Plugin::instance()->widgets_manager->register_widget_type(new LibrasBlogElementorWidget());
    }
}

new ElementorLibrasBlog();
?>