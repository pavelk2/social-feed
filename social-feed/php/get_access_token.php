<?php
include ('settings.php');
global $app_id,$app_secret;
$app_token_url = "https://graph.facebook.com/oauth/access_token?"
        . "client_id=" . $app_id
        . "&client_secret=" . $app_secret
        . "&grant_type=client_credentials";

$response = file_get_contents($app_token_url);
$params = null;
parse_str($response, $params);
echo($params['access_token']);
?>