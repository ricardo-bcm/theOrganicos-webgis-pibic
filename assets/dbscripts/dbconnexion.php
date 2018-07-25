<?php
$host = 'localhost';
$port = '5432';
$database = 'the_organicos';
$user = 'postgres';
$password = 'erre';

$connexion = pg_connect("host=$host port=$port dbname=$database user=$user password=$password");