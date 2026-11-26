export function AppsSkeleton() {
    return (
        <div
            className="apps-skeleton"
            role="status"
            aria-label="Loading applications"
        >
            {Array.from({ length: 2 }, (_, card) => (
                <div className="panel apps-skeleton-card" key={card} aria-hidden="true">
                    <div className="apps-skeleton-heading">
                        <span />
                        <span />
                    </div>
                    <span className="apps-skeleton-line" />
                    <span className="apps-skeleton-line apps-skeleton-short" />
                    <span className="apps-skeleton-line" />
                </div>
            ))}
        </div>
    );
}
