
/**
 * Mensagens Futuras Widget
 * Kommo CRM Widget for scheduling future messages
 */

(function() {
    'use strict';

    // Widget namespace
    var MensagensFuturas = {
        // Configuration
        settings: {
            name: 'mensagens-futuras',
            version: '1.0.0',
            widgetName: 'MensagensFuturas',
            customFields: {
                messageText: 'Mensagem Agendada - Texto',
                scheduledDateTime: 'Mensagem Agendada - Data/Hora Envio',
                status: 'Mensagem Agendada - Status'
            }
        },

        // Widget data
        data: {
            messages: [],
            currentEntity: null,
            currentUser: null,
            i18n: {}
        },

        // Initialize widget
        init: function() {
            console.log('Initializing Mensagens Futuras Widget');
            
            this.bindEvents();
            this.loadMessages();
            this.startPolling();
            
            return true;
        },

        // Event binding
        bindEvents: function() {
            var self = this;
            
            // Schedule new message button
            $(document).on('click', '.js-schedule-message', function(e) {
                e.preventDefault();
                self.openScheduleModal();
            });

            // Edit message button
            $(document).on('click', '.js-edit-message', function(e) {
                e.preventDefault();
                var messageId = $(this).data('message-id');
                self.openEditModal(messageId);
            });

            // Delete message button
            $(document).on('click', '.js-delete-message', function(e) {
                e.preventDefault();
                var messageId = $(this).data('message-id');
                self.deleteMessage(messageId);
            });

            // Save message in modal
            $(document).on('click', '.js-save-message', function(e) {
                e.preventDefault();
                self.saveMessage();
            });

            // Cancel modal
            $(document).on('click', '.js-cancel-modal', function(e) {
                e.preventDefault();
                self.closeModal();
            });
        },

        // Load messages from storage
        loadMessages: function() {
            try {
                var storedMessages = this.getCustomParam('scheduled_messages');
                this.data.messages = storedMessages ? JSON.parse(storedMessages) : [];
                this.renderWidget();
            } catch (error) {
                console.error('Error loading messages:', error);
                this.data.messages = [];
            }
        },

        // Save messages to storage
        saveMessages: function() {
            try {
                this.setCustomParam('scheduled_messages', JSON.stringify(this.data.messages));
                return true;
            } catch (error) {
                console.error('Error saving messages:', error);
                return false;
            }
        },

        // Open schedule modal
        openScheduleModal: function() {
            var template = this.getTemplate('schedule_modal');
            var html = template.render({
                i18n: this.data.i18n,
                isEdit: false,
                message: null
            });
            
            this.openModal(html);
        },

        // Open edit modal
        openEditModal: function(messageId) {
            var message = this.getMessageById(messageId);
            if (!message) {
                console.error('Message not found:', messageId);
                return;
            }

            var template = this.getTemplate('schedule_modal');
            var html = template.render({
                i18n: this.data.i18n,
                isEdit: true,
                message: message
            });
            
            this.openModal(html);
        },

        // Save message (create or update)
        saveMessage: function() {
            var messageText = $('.js-message-text').val().trim();
            var scheduledDateTime = $('.js-scheduled-datetime').val().trim();
            var messageId = $('.js-message-id').val();

            // Validate inputs
            if (!messageText || !scheduledDateTime) {
                this.showError(this.data.i18n.validation_error);
                return;
            }

            var currentUser = this.getCurrentUser();
            var currentEntity = this.getCurrentEntity();
            
            if (messageId) {
                // Update existing message
                this.updateMessage(messageId, messageText, scheduledDateTime, currentUser);
            } else {
                // Create new message
                this.createMessage(messageText, scheduledDateTime, currentUser, currentEntity);
            }
        },

        // Create new message
        createMessage: function(messageText, scheduledDateTime, user, entity) {
            var newMessage = {
                id: this.generateId(),
                entityType: entity.type,
                entityId: entity.id,
                messageText: messageText,
                scheduledDateTime: scheduledDateTime,
                currentStatus: 'Agendada',
                auditLog: [{
                    action: 'agendado',
                    userId: user.id,
                    userName: user.name,
                    timestamp: new Date().toISOString()
                }]
            };

            this.data.messages.push(newMessage);
            
            if (this.saveMessages()) {
                this.updateCustomFields(newMessage);
                this.closeModal();
                this.renderWidget();
                this.showSuccess(this.data.i18n.message_saved);
            } else {
                this.showError(this.data.i18n.save_error);
            }
        },

        // Update existing message
        updateMessage: function(messageId, messageText, scheduledDateTime, user) {
            var message = this.getMessageById(messageId);
            if (!message) return;

            var oldText = message.messageText;
            var oldDateTime = message.scheduledDateTime;

            message.messageText = messageText;
            message.scheduledDateTime = scheduledDateTime;
            
            // Add audit log entry
            message.auditLog.push({
                action: 'editado',
                userId: user.id,
                userName: user.name,
                timestamp: new Date().toISOString(),
                changes: {
                    oldMessage: oldText,
                    newMessage: messageText,
                    oldDateTime: oldDateTime,
                    newDateTime: scheduledDateTime
                }
            });

            if (this.saveMessages()) {
                this.updateCustomFields(message);
                this.closeModal();
                this.renderWidget();
                this.showSuccess(this.data.i18n.message_saved);
            } else {
                this.showError(this.data.i18n.save_error);
            }
        },

        // Delete message
        deleteMessage: function(messageId) {
            if (!confirm(this.data.i18n.confirm_delete)) {
                return;
            }

            var message = this.getMessageById(messageId);
            if (!message) return;

            var currentUser = this.getCurrentUser();
            
            message.currentStatus = 'Cancelada';
            message.auditLog.push({
                action: 'excluido',
                userId: currentUser.id,
                userName: currentUser.name,
                timestamp: new Date().toISOString()
            });

            if (this.saveMessages()) {
                this.updateCustomFields(message);
                this.renderWidget();
                this.showSuccess(this.data.i18n.message_deleted);
            } else {
                this.showError(this.data.i18n.save_error);
            }
        },

        // Get message by ID
        getMessageById: function(messageId) {
            return this.data.messages.find(function(msg) {
                return msg.id === messageId;
            });
        },

        // Update Kommo custom fields
        updateCustomFields: function(message) {
            try {
                var fields = {};
                fields[this.settings.customFields.messageText] = message.messageText;
                fields[this.settings.customFields.scheduledDateTime] = message.scheduledDateTime;
                fields[this.settings.customFields.status] = message.currentStatus;

                // Update fields in Kommo
                this.updateEntityFields(message.entityType, message.entityId, fields);
            } catch (error) {
                console.error('Error updating custom fields:', error);
            }
        },

        // Polling for message triggers
        startPolling: function() {
            var self = this;
            setInterval(function() {
                self.checkScheduledMessages();
            }, 60000); // Check every minute
        },

        // Check for messages ready to send
        checkScheduledMessages: function() {
            var now = new Date();
            var messagesToTrigger = this.data.messages.filter(function(message) {
                if (message.currentStatus !== 'Agendada') return false;
                
                var scheduledTime = new Date(message.scheduledDateTime);
                return scheduledTime <= now;
            });

            messagesToTrigger.forEach(function(message) {
                this.triggerMessage(message);
            }, this);
        },

        // Trigger message for Salesbot
        triggerMessage: function(message) {
            message.currentStatus = 'Para Enviar';
            message.auditLog.push({
                action: 'triggered',
                timestamp: new Date().toISOString(),
                note: 'Status changed to Para Enviar for Salesbot processing'
            });

            this.updateCustomFields(message);
            this.saveMessages();
        },

        // Render widget
        renderWidget: function() {
            var currentEntity = this.getCurrentEntity();
            var entityMessages = this.getMessagesForEntity(currentEntity);
            
            var template = this.getTemplate('widget');
            var html = template.render({
                i18n: this.data.i18n,
                messages: entityMessages,
                entityType: currentEntity.type
            });

            this.getWidgetContainer().html(html);
        },

        // Get messages for current entity
        getMessagesForEntity: function(entity) {
            return this.data.messages.filter(function(message) {
                return message.entityType === entity.type && 
                       message.entityId === entity.id;
            });
        },

        // Utility functions
        generateId: function() {
            return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        getCurrentUser: function() {
            // Mock implementation - should integrate with Kommo user API
            return {
                id: 1,
                name: 'Current User'
            };
        },

        getCurrentEntity: function() {
            // Mock implementation - should integrate with Kommo entity API
            return {
                type: 'leads',
                id: 1
            };
        },

        getTemplate: function(templateName) {
            // Mock implementation - should load and compile Twig templates
            return {
                render: function(data) {
                    return '<div>Template: ' + templateName + '</div>';
                }
            };
        },

        getWidgetContainer: function() {
            return $('.mensagens-futuras-widget');
        },

        getCustomParam: function(key) {
            // Mock implementation - should integrate with Kommo widget params
            return localStorage.getItem(this.settings.name + '_' + key);
        },

        setCustomParam: function(key, value) {
            // Mock implementation - should integrate with Kommo widget params
            localStorage.setItem(this.settings.name + '_' + key, value);
        },

        updateEntityFields: function(entityType, entityId, fields) {
            // Mock implementation - should integrate with Kommo API
            console.log('Updating entity fields:', entityType, entityId, fields);
        },

        openModal: function(html) {
            // Mock implementation - should integrate with Kommo modal system
            console.log('Opening modal:', html);
        },

        closeModal: function() {
            // Mock implementation - should integrate with Kommo modal system
            console.log('Closing modal');
        },

        showSuccess: function(message) {
            // Mock implementation - should integrate with Kommo notification system
            console.log('Success:', message);
        },

        showError: function(message) {
            // Mock implementation - should integrate with Kommo notification system
            console.error('Error:', message);
        }
    };

    // Export to global scope for Kommo
    window.MensagensFuturas = MensagensFuturas;

    // Auto-initialize if in Kommo environment
    if (typeof AMOCRM !== 'undefined') {
        $(document).ready(function() {
            MensagensFuturas.init();
        });
    }

})();
