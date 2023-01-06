<?php
require('../client.inc.php');
define('SOURCE','Web'); //Ticket source.
$ticket = null;
$errors=array();
if ($_POST) {
    $vars = $_POST;
    $vars['deptId']=$vars['emailId']=0; //Just Making sure we don't accept crap...only topicId is expected.
    if ($thisclient) {
        $vars['uid']=$thisclient->getId();
    } elseif($cfg->isCaptchaEnabled()) {
        if(!$_POST['captcha'])
            $errors['captcha']=__('Enter text shown on the image');
        elseif(strcmp($_SESSION['captcha'], md5(strtoupper($_POST['captcha']))))
            $errors['captcha']=sprintf('%s - %s', __('Invalid'), __('Please try again!'));
    }

    $tform = TicketForm::objects()->one()->getForm($vars);
    $messageField = $tform->getField('message');
    $attachments = $messageField->getWidget()->getAttachments();
    if (!$errors) {
        $vars['message'] = $messageField->getClean();
        if ($messageField->isAttachmentsEnabled())
            $vars['files'] = $attachments->getFiles();
    }

    // Drop the draft.. If there are validation errors, the content
    // submitted will be displayed back to the user
    Draft::deleteForNamespace('ticket.client.'.substr(session_id(), -12));
    //Ticket::create...checks for errors..
    if(($ticket=Ticket::create($vars, $errors, SOURCE))){
        $msg=__('Support ticket request created');
        // Drop session-backed form data
        unset($_SESSION[':form-data']);
        //Logged in...simply view the newly created ticket.
        if ($thisclient && $thisclient->isValid()) {
            // Regenerate session id
            $thisclient->regenerateSession();
            @header('Location: tickets.php?id='.$ticket->getId());
        } else
            $ost->getCSRF()->rotate();
    }else{
        $errors['err'] = $errors['err'] ?: sprintf('%s %s',
            __('Unable to create a ticket.'),
            __('Correct any errors below and try again.'));
    }
}
?>
ok