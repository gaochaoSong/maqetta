package org.davinci.server.review.user;

import org.davinci.server.review.Version;

public interface IReviewManager {

    public abstract void saveDraft(IDesignerUser user, Version version);

    public abstract void publish(IDesignerUser user, Version version);

    public abstract void saveVersionFile(IDesignerUser user);

    public abstract IDesignerUser getDesignerUser(String name);
}