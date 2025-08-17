import React from 'react';

export function FooterCTA() {
  return (
    <div className="text-center my-6">
      <a className="btn" href="#" onClick={(e)=>e.preventDefault()} aria-label="Book AdNativ">
        Want a free 15-min teardown? Book AdNativ
      </a>
    </div>
  );
}
