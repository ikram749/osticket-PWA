        </div>
        </div>
        <div id="footer">
            <p><?php echo __('Copyright &copy;'); ?> <?php echo date('Y'); ?> <?php
                                                                                echo Format::htmlchars((string) $ost->company ?: 'osTicket.com'); ?> - <?php echo __('All rights reserved.'); ?></p>
            <a id="poweredBy" href="https://osticket.com" target="_blank"><?php echo __('Helpdesk software - powered by osTicket'); ?></a>
        </div>
        <div id="overlay"></div>
        <div id="loading">
            <h4><?php echo __('Please Wait!'); ?></h4>
            <p><?php echo __('Please wait... it will take a second!'); ?></p>
        </div>
        <button id="install" class="btn btn-primary" >install</button>
        <button id="enable" class="btn btn-primary" >enable</button>
        <button id="remove" class="btn btn-primary" >remove</button>
        <?php
        if (($lang = Internationalization::getCurrentLanguage()) && $lang != 'en_US') { ?>
            <script type="text/javascript" src="<?php echo ROOT_PATH; ?>ajax.php/i18n/<?php
                                                                                        echo $lang; ?>/js"></script>
        <?php } ?>
        <script type="text/javascript">
            getConfig().resolve(<?php
                                include INCLUDE_DIR . 'ajax.config.php';
                                $api = new ConfigAjaxAPI();
                                print $api->client(false);
                                ?>);
        </script>

        <script src="./pwa/script_new.js" type="text/javascript"></script>
        <!-- <script>
            const form = document.querySelector('#ticketForm');
            const submitBtn = document.querySelectorAll('input[type="submit"]');

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                if (navigator.onLine) {
                    // User is online, submit the form via AJAX
                    const formData = new FormData(form);
                    fetch('open.php', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => {
                            // Handle response from server
                            $('#overlay,#loading').hide();
                            (response.status == 200) ? window.location.reload() : alert('Form data failed to submit');
                            console.log(response)
                        })
                        .catch(error => {
                            console.error(error);
                        });
                } else {
                    // User is offline, store form data in local storage
                    const formData = new FormData(form);
                    const data = [];
                    /* const data = {
                        'email': document.getElementsByName("0f05f452351f22").value, //email
                        'fullname': document.getElementsByName("b8dff533adfe64").value, //fullname
                        'phone': document.getElementsByName("855e8f87902216").value, //phone number
                        'phoneext': document.getElementsByName("855e8f87902216-ext").value, //phone number
                        'topicId': document.getElementsByName("topicId").value, //topicId
                        'issues': document.getElementsByName("d61874fa8df8ca").value, //issues summary
                        'reason': document.getElementsByName("288dcd7a6eacb4").value, //reason
                    }; */
                    //localStorage.setItem('form-data', JSON.stringify(data));
                    
                    /* for (const [name, value] of formData.entries()) {
                        if(name != '__CSRFToken__'){
                                data.push({
                                name: `${name}`,
                                value: `${value}`
                            });
                        }
                    } */
                    //console.log(data)
                    localStorage.setItem('form-data', JSON.stringify($("#ticketForm").serialize()));
                    alert('Form data stored offline');
                }
            });

            // Check for stored form data when the page loads
            window.addEventListener('load', function() {
                const storedData = localStorage.getItem('form-data');
                if (storedData) {
                    submitBtn.disabled = true; // Disable submit button if there's stored data
                }
            });

            // Check if user is back online, and submit stored data if so
            window.addEventListener('online', function() {
                const storedData = localStorage.getItem('form-data');
                if (storedData) {
                    submitBtn.disabled = false;
                    const data = JSON.parse(storedData);
                    const formData = new FormData();
                    formData.set('__CSRFToken__', $("meta[name=csrf_token]").attr("content"));
                    for (const [name, value] of formData.entries()) {
                        formData.append(`${name}`, `${value}`);
                    }

                    fetch('open.php', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => {
                            localStorage.removeItem('form-data');
                            // Handle response from server
                            $('#overlay,#loading').hide();
                            (response.status == 200) ? window.location.reload() : alert('Form data failed to submit');
                            console.log(response)
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }
            });
        </script> -->
        </body>

        </html>