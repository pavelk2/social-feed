<?php $p = $_POST; ?>
<div class="social-feed-element" dt_create="<?php echo $p['dt_create']; ?>">
    <a class="pull-left" href="<?php echo $p['author_link']; ?>" target="_blank">
        <img class="media-object" src="<?php echo $p['author_picture']; ?>">
    </a>
    <div class="media-body">
        <p><img class="social-network-icon" title="posted by <?php echo $p['social_network']; ?>" src="<?php echo $p['social_icon']; ?>" /><span class="author-title"><?php echo $p['author_name']; ?></span>
            <span class="muted"> - <?php echo $p['time_ago']; ?></span>  
            <a href="<?php echo $p['link']; ?>" target="_blank" class="read-button">
                <span class="label label-info">open </span>
            </a>
        </p>
        <div>
            <p class="social-feed-text">
                <?php echo htmlspecialchars_decode($p['text']); ?>
            </p>
        </div>
    </div>
</div>