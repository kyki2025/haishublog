<?php
if (!defined('ABSPATH')) exit;

class LibrasBlogElementorWidget extends \Elementor\Widget_Base {
    
    public function get_name() {
        return 'libras_blog';
    }
    
    public function get_title() {
        return 'Blog Libras';
    }
    
    public function get_icon() {
        return 'eicon-posts-grid';
    }
    
    public function get_categories() {
        return ['general'];
    }
    
    protected function _register_controls() {
        
        // Seção de Conteúdo
        $this->start_controls_section(
            'content_section',
            [
                'label' => 'Configurações do Blog',
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );
        
        $this->add_control(
            'blog_page',
            [
                'label' => 'Página a Exibir',
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'home',
                'options' => [
                    'home' => 'Página Inicial',
                    'favorites' => 'Favoritos',
                    'category' => 'Por Categoria',
                ],
            ]
        );
        
        $this->add_control(
            'category_filter',
            [
                'label' => 'Categoria',
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => '',
                'options' => [
                    '' => 'Todas',
                    'Fundamentos' => 'Fundamentos',
                    'Cultura' => 'Cultura',
                    'Tecnologia' => 'Tecnologia',
                    'Aprendizado' => 'Aprendizado',
                    'Educação' => 'Educação',
                ],
                'condition' => [
                    'blog_page' => 'category',
                ],
            ]
        );
        
        $this->add_control(
            'posts_limit',
            [
                'label' => 'Número de Posts',
                'type' => \Elementor\Controls_Manager::NUMBER,
                'default' => 10,
                'min' => 1,
                'max' => 50,
            ]
        );
        
        $this->add_control(
            'container_height',
            [
                'label' => 'Altura do Container',
                'type' => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px', 'vh'],
                'range' => [
                    'px' => [
                        'min' => 400,
                        'max' => 2000,
                    ],
                    'vh' => [
                        'min' => 40,
                        'max' => 100,
                    ],
                ],
                'default' => [
                    'unit' => 'px',
                    'size' => 800,
                ],
                'selectors' => [
                    '{{WRAPPER}} #libras-blog-root' => 'min-height: {{SIZE}}{{UNIT}};',
                ],
            ]
        );
        
        $this->end_controls_section();
        
        // Seção de Estilo
        $this->start_controls_section(
            'style_section',
            [
                'label' => 'Estilo',
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );
        
        $this->add_control(
            'background_color',
            [
                'label' => 'Cor de Fundo',
                'type' => \Elementor\Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} #libras-blog-root' => 'background-color: {{VALUE}};',
                ],
            ]
        );
        
        $this->add_group_control(
            \Elementor\Group_Control_Border::get_type(),
            [
                'name' => 'border',
                'label' => 'Borda',
                'selector' => '{{WRAPPER}} #libras-blog-root',
            ]
        );
        
        $this->add_control(
            'border_radius',
            [
                'label' => 'Border Radius',
                'type' => \Elementor\Controls_Manager::DIMENSIONS,
                'size_units' => ['px', '%'],
                'selectors' => [
                    '{{WRAPPER}} #libras-blog-root' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
                ],
            ]
        );
        
        $this->end_controls_section();
    }
    
    protected function render() {
        $settings = $this->get_settings_for_display();
        
        $height = $settings['container_height']['size'] . $settings['container_height']['unit'];
        $page = $settings['blog_page'];
        $category = $settings['category_filter'];
        $limit = $settings['posts_limit'];
        
        echo do_shortcode("[libras_blog height='$height' page='$page' category='$category' limit='$limit']");
    }
}
?>