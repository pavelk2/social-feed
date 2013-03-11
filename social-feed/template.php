<div class="media social-feed-element" dt_create="'+data['dt_create']+'">
    <a class="pull-left" href="' + data['author_link'] + '" target="_blank">
        <img class="media-object" src="'+data['author_picture']+'">
    </a>
    <div class="media-body">
        <p>
            <img class="social-network-icon" src="'+options.plugin_folder+'/img/'+data['social-network']+'-icon-24.png">
            '+data['author_name']+'
            <a href="'+data['link']+'" target="_blank" class="read-button">
                <span class="label label-info">read </span>
            </a>
        </p>
        <div>
            '+replaceText(short_text(data['message']+' '+data['description']))+' 
        </div>

    </div>

</div>