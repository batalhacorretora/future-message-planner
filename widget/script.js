
/**
 * Mensagens Futuras Widget - Main Script
 * Kommo CRM Widget for scheduling future messages
 */

define(['jquery', 'twig'], function($, Twig) {
  'use strict';

  var MensagensFuturasWidget = function() {
    var self = this;
    
    // Widget properties
    this.callbacks = {
      render: this.render.bind(this),
      init: this.init.bind(this),
      bind_actions: this.bindActions.bind(this),
      settings: this.settings.bind(this),
      destroy: this.destroy.bind(this)
    };

    // Templates cache
    this.templates = {};
    
    // Current data
    this.currentData = {
      messages: [],
      currentEntity: null,
      user: null
    };

    // Custom field IDs (will be set during initialization)
    this.customFields = {
      messageText: null,
      scheduledDateTime: null,
      messageStatus: null
    };

    return this;
  };

  /**
   * Widget initialization
   */
  MensagensFuturasWidget.prototype.init = function() {
    var self = this;
    
    // Get current user info
    this.currentData.user = AMOCRM.constant('user');
    
    // Initialize custom fields
    this.initializeCustomFields();
    
    // Load stored messages
    this.loadStoredMessages();
    
    // Set up polling for salesbot triggers (every 30 seconds)
    this.setupPolling();
    
    console.log('Mensagens Futuras Widget initialized');
    
    return true;
  };

  /**
   * Render widget based on location
   */
  MensagensFuturasWidget.prototype.render = function() {
    var self = this;
    var location = this.system().area;
    
    switch(location) {
      case 'lcard-1':
      case 'ccard-0':
        return this.renderSidebarWidget();
      case 'settings':
        return this.renderSettingsPage();
      default:
        return '';
    }
  };

  /**
   * Render sidebar widget for leads/contacts
   */
  MensagensFuturasWidget.prototype.renderSidebarWidget = function() {
    var self = this;
    var entityType = this.system().area === 'lcard-1' ? 'leads' : 'contacts';
    var entityId = this.system().card_id;
    
    this.currentData.currentEntity = {
      type: entityType,
      id: entityId
    };

    var entityMessages = this.getMessagesForEntity(entityId);
    
    var template = this.getTemplate('widget');
    return template.render({
      messages: entityMessages,
      entityType: entityType,
      entityId: entityId,
      i18n: this.getI18n()
    });
  };

  /**
   * Render settings page
   */
  MensagensFuturasWidget.prototype.renderSettingsPage = function() {
    var template = this.getTemplate('settings_page');
    return template.render({
      messages: this.currentData.messages,
      i18n: this.getI18n()
    });
  };

  /**
   * Bind widget actions
   */
  MensagensFuturasWidget.prototype.bindActions = function() {
    var self = this;
    var $widget = $(this.get_container());

    // Schedule new message button
    $widget.on('click', '.js-schedule-message', function(e) {
      e.preventDefault();
      self.openScheduleModal();
    });

    // Edit message button
    $widget.on('click', '.js-edit-message', function(e) {
      e.preventDefault();
      var messageId = $(this).data('message-id');
      self.openScheduleModal(messageId);
    });

    // Delete message button
    $widget.on('click', '.js-delete-message', function(e) {
      e.preventDefault();
      var messageId = $(this).data('message-id');
      self.deleteMessage(messageId);
    });

    return true;
  };

  /**
   * Open schedule modal
   */
  MensagensFuturasWidget.prototype.openScheduleModal = function(messageId) {
    var self = this;
    var message = messageId ? this.findMessageById(messageId) : null;
    
    var template = this.getTemplate('schedule_modal');
    var modalHtml = template.render({
      message: message,
      isEdit: !!messageId,
      i18n: this.getI18n()
    });

    // Create modal using Kommo's modal system
    var modal = new AMOCRM.widgets.Modal({
      class_name: 'mensagens-futuras-modal',
      init: function($modal_body) {
        $modal_body.html(modalHtml);
        self.bindModalActions($modal_body, messageId);
      }
    });

    modal.show();
  };

  /**
   * Bind modal form actions
   */
  MensagensFuturasWidget.prototype.bindModalActions = function($modal, messageId) {
    var self = this;

    // Save message button
    $modal.on('click', '.js-save-message', function(e) {
      e.preventDefault();
      self.saveMessage($modal, messageId);
    });

    // Cancel button
    $modal.on('click', '.js-cancel-modal', function(e) {
      e.preventDefault();
      $modal.closest('.modal').find('.modal_cancel').click();
    });

    // Initialize datetime picker
    $modal.find('.js-datetime-picker').each(function() {
      $(this).datetimepicker({
        format: 'Y-m-d H:i',
        minDate: new Date(),
        lang: self.getLocale()
      });
    });
  };

  /**
   * Save scheduled message
   */
  MensagensFuturasWidget.prototype.saveMessage = function($modal, messageId) {
    var self = this;
    var isEdit = !!messageId;
    
    var formData = {
      messageText: $modal.find('.js-message-text').val().trim(),
      scheduledDateTime: $modal.find('.js-scheduled-datetime').val(),
      entityId: this.currentData.currentEntity.id,
      entityType: this.currentData.currentEntity.type
    };

    // Validate form
    if (!this.validateMessageForm(formData)) {
      this.showError(this.getI18n().validation_error);
      return;
    }

    try {
      if (isEdit) {
        this.updateMessage(messageId, formData);
      } else {
        this.createMessage(formData);
      }

      // Close modal
      $modal.closest('.modal').find('.modal_cancel').click();
      
      // Show success message
      this.showSuccess(this.getI18n().message_saved);
      
      // Refresh widget
      this.refresh();
      
    } catch (error) {
      console.error('Error saving message:', error);
      this.showError(this.getI18n().save_error);
    }
  };

  /**
   * Create new scheduled message
   */
  MensagensFuturasWidget.prototype.createMessage = function(formData) {
    var message = {
      id: this.generateId(),
      entityId: formData.entityId,
      entityType: formData.entityType,
      messageText: formData.messageText,
      scheduledDateTime: formData.scheduledDateTime,
      currentStatus: 'Agendada',
      auditLog: [{
        action: 'agendado',
        userId: this.currentData.user.id,
        userName: this.currentData.user.name,
        timestamp: new Date().toISOString()
      }]
    };

    this.currentData.messages.push(message);
    this.saveToStorage();
    this.updateCustomFields(formData.entityId, formData.entityType, message);
  };

  /**
   * Update existing message
   */
  MensagensFuturasWidget.prototype.updateMessage = function(messageId, formData) {
    var message = this.findMessageById(messageId);
    if (!message) return;

    var oldMessage = JSON.parse(JSON.stringify(message));
    
    message.messageText = formData.messageText;
    message.scheduledDateTime = formData.scheduledDateTime;
    message.auditLog.push({
      action: 'editado',
      userId: this.currentData.user.id,
      userName: this.currentData.user.name,
      timestamp: new Date().toISOString(),
      changes: {
        oldMessage: oldMessage.messageText,
        newMessage: formData.messageText,
        oldDateTime: oldMessage.scheduledDateTime,
        newDateTime: formData.scheduledDateTime
      }
    });

    this.saveToStorage();
    this.updateCustomFields(message.entityId, message.entityType, message);
  };

  /**
   * Delete message
   */
  MensagensFuturasWidget.prototype.deleteMessage = function(messageId) {
    var self = this;
    
    if (!confirm(this.getI18n().confirm_delete)) {
      return;
    }

    var message = this.findMessageById(messageId);
    if (!message) return;

    message.currentStatus = 'Cancelada';
    message.auditLog.push({
      action: 'excluido',
      userId: this.currentData.user.id,
      userName: this.currentData.user.name,
      timestamp: new Date().toISOString()
    });

    this.saveToStorage();
    this.updateCustomFields(message.entityId, message.entityType, message);
    this.refresh();
    this.showSuccess(this.getI18n().message_deleted);
  };

  /**
   * Initialize custom fields for Salesbot integration
   */
  MensagensFuturasWidget.prototype.initializeCustomFields = function() {
    // These field IDs should be configured during widget installation
    this.customFields = {
      messageText: this.get_settings().message_text_field_id || null,
      scheduledDateTime: this.get_settings().scheduled_datetime_field_id || null,
      messageStatus: this.get_settings().message_status_field_id || null
    };
  };

  /**
   * Update Kommo custom fields for Salesbot integration
   */
  MensagensFuturasWidget.prototype.updateCustomFields = function(entityId, entityType, message) {
    if (!this.customFields.messageText || !this.customFields.scheduledDateTime || !this.customFields.messageStatus) {
      console.warn('Custom fields not configured for Salesbot integration');
      return;
    }

    var updateData = {};
    updateData[this.customFields.messageText] = message.messageText;
    updateData[this.customFields.scheduledDateTime] = message.scheduledDateTime;
    updateData[this.customFields.messageStatus] = message.currentStatus;

    // Update entity using Kommo API
    var endpoint = entityType === 'leads' ? 'leads' : 'contacts';
    
    $.ajax({
      url: '/api/v4/' + endpoint + '/' + entityId,
      method: 'PATCH',
      data: {
        custom_fields_values: this.formatCustomFieldsForAPI(updateData)
      },
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).done(function(response) {
      console.log('Custom fields updated successfully');
    }).fail(function(xhr, status, error) {
      console.error('Failed to update custom fields:', error);
    });
  };

  /**
   * Format custom fields data for Kommo API
   */
  MensagensFuturasWidget.prototype.formatCustomFieldsForAPI = function(data) {
    var formatted = [];
    
    for (var fieldId in data) {
      formatted.push({
        field_id: parseInt(fieldId),
        values: [{
          value: data[fieldId]
        }]
      });
    }
    
    return formatted;
  };

  /**
   * Setup polling for Salesbot triggers
   */
  MensagensFuturasWidget.prototype.setupPolling = function() {
    var self = this;
    
    // Check every 30 seconds for messages ready to send
    setInterval(function() {
      self.checkForReadyMessages();
    }, 30000);
  };

  /**
   * Check for messages ready to be sent
   */
  MensagensFuturasWidget.prototype.checkForReadyMessages = function() {
    var now = new Date();
    var readyMessages = this.currentData.messages.filter(function(message) {
      return message.currentStatus === 'Agendada' && 
             new Date(message.scheduledDateTime) <= now;
    });

    readyMessages.forEach(function(message) {
      message.currentStatus = 'Para Enviar';
      this.updateCustomFields(message.entityId, message.entityType, message);
    }.bind(this));

    if (readyMessages.length > 0) {
      this.saveToStorage();
    }
  };

  /**
   * Load stored messages from widget parameters
   */
  MensagensFuturasWidget.prototype.loadStoredMessages = function() {
    var stored = this.get_settings().stored_messages;
    this.currentData.messages = stored ? JSON.parse(stored) : [];
  };

  /**
   * Save messages to widget storage
   */
  MensagensFuturasWidget.prototype.saveToStorage = function() {
    this.save_settings({
      stored_messages: JSON.stringify(this.currentData.messages)
    });
  };

  /**
   * Get messages for specific entity
   */
  MensagensFuturasWidget.prototype.getMessagesForEntity = function(entityId) {
    return this.currentData.messages.filter(function(message) {
      return message.entityId == entityId;
    });
  };

  /**
   * Find message by ID
   */
  MensagensFuturasWidget.prototype.findMessageById = function(messageId) {
    return this.currentData.messages.find(function(message) {
      return message.id === messageId;
    });
  };

  /**
   * Generate unique ID
   */
  MensagensFuturasWidget.prototype.generateId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  /**
   * Validate message form
   */
  MensagensFuturasWidget.prototype.validateMessageForm = function(formData) {
    if (!formData.messageText || formData.messageText.length < 1) {
      return false;
    }
    
    if (!formData.scheduledDateTime) {
      return false;
    }
    
    var scheduledDate = new Date(formData.scheduledDateTime);
    if (scheduledDate <= new Date()) {
      return false;
    }
    
    return true;
  };

  /**
   * Get Twig template
   */
  MensagensFuturasWidget.prototype.getTemplate = function(templateName) {
    if (!this.templates[templateName]) {
      // Load template from server or define inline
      this.templates[templateName] = Twig.twig({
        id: templateName,
        href: this.get_template_path(templateName + '.twig')
      });
    }
    return this.templates[templateName];
  };

  /**
   * Get localized strings
   */
  MensagensFuturasWidget.prototype.getI18n = function() {
    var locale = this.getLocale();
    var strings = {
      pt: {
        schedule_new_message: 'Agendar Nova Mensagem',
        scheduled_messages: 'Mensagens Agendadas',
        edit: 'Editar',
        delete: 'Excluir',
        message_text: 'Texto da Mensagem',
        scheduled_datetime: 'Data e Hora do Envio',
        save_message: 'Agendar Mensagem',
        cancel: 'Cancelar',
        status: 'Status',
        scheduled_by: 'Agendada por',
        scheduled_at: 'Agendada em',
        message_saved: 'Mensagem agendada com sucesso!',
        message_deleted: 'Mensagem excluída com sucesso!',
        save_error: 'Não foi possível agendar sua mensagem. Tente novamente.',
        validation_error: 'Por favor, preencha todos os campos obrigatórios.',
        confirm_delete: 'Tem certeza que deseja excluir esta mensagem?'
      },
      es: {
        schedule_new_message: 'Programar Nuevo Mensaje',
        scheduled_messages: 'Mensajes Programados',
        edit: 'Editar',
        delete: 'Eliminar',
        message_text: 'Texto del Mensaje',
        scheduled_datetime: 'Fecha y Hora de Envío',
        save_message: 'Programar Mensaje',
        cancel: 'Cancelar',
        status: 'Estado',
        scheduled_by: 'Programado por',
        scheduled_at: 'Programado en',
        message_saved: '¡Mensaje programado con éxito!',
        message_deleted: '¡Mensaje eliminado con éxito!',
        save_error: 'No se pudo programar su mensaje. Inténtelo de nuevo.',
        validation_error: 'Por favor, complete todos los campos obligatorios.',
        confirm_delete: '¿Está seguro de que desea eliminar este mensaje?'
      },
      en: {
        schedule_new_message: 'Schedule New Message',
        scheduled_messages: 'Scheduled Messages',
        edit: 'Edit',
        delete: 'Delete',
        message_text: 'Message Text',
        scheduled_datetime: 'Send Date & Time',
        save_message: 'Schedule Message',
        cancel: 'Cancel',
        status: 'Status',
        scheduled_by: 'Scheduled by',
        scheduled_at: 'Scheduled at',
        message_saved: 'Message scheduled successfully!',
        message_deleted: 'Message deleted successfully!',
        save_error: 'Could not schedule your message. Please try again.',
        validation_error: 'Please fill in all required fields.',
        confirm_delete: 'Are you sure you want to delete this message?'
      }
    };
    
    return strings[locale] || strings.en;
  };

  /**
   * Get current locale
   */
  MensagensFuturasWidget.prototype.getLocale = function() {
    return AMOCRM.constant('lang') || 'en';
  };

  /**
   * Show success message
   */
  MensagensFuturasWidget.prototype.showSuccess = function(message) {
    AMOCRM.notifications.show_message({
      header: 'Success',
      text: message,
      type: 'success'
    });
  };

  /**
   * Show error message
   */
  MensagensFuturasWidget.prototype.showError = function(message) {
    AMOCRM.notifications.show_message({
      header: 'Error',
      text: message,
      type: 'error'
    });
  };

  /**
   * Refresh widget
   */
  MensagensFuturasWidget.prototype.refresh = function() {
    this.render();
  };

  /**
   * Widget settings page
   */
  MensagensFuturasWidget.prototype.settings = function() {
    return this.renderSettingsPage();
  };

  /**
   * Destroy widget
   */
  MensagensFuturasWidget.prototype.destroy = function() {
    // Clean up any intervals or event listeners
    return true;
  };

  return MensagensFuturasWidget;
});
