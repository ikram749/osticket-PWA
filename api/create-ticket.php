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
        $msg='Support ticket request created';
    }else{
        $msg='Unable to create a ticket';
    }
    //return $msg;
    header('Content-type: application/json');
    echo json_encode($msg);
}
?>