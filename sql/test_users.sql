INSERT INTO public.auth_user (
        id,
        username,
        username_lowercase,
        "role",
        joined
    )
VALUES (
        'RanobeBot',
        'RanobeBot',
        'ranobebot',
        'admin',
        '2024-02-16 19:17:15.567727-08'
    ),
    (
        'Deleted',
        'Deleted',
        'deleted',
        'admin',
        '2024-02-16 19:17:15.567727-08'
    ),
    (
        '9ugxrixoqb5u64x',
        'Blastose',
        'blastose',
        'admin',
        '2024-02-16 19:17:15.567727-08'
    ),
    (
        'ap0mo8i0vvog6wi',
        'TestUser',
        'testuser',
        'user',
        '2024-02-16 19:19:04.89713-08'
    ),
    (
        'q5tphufdf9pdlyo',
        'TestUserMod',
        'testusermod',
        'moderator',
        '2024-02-16 19:20:35.378687-08'
    ),
    (
        '0opogjc1rrkdc6r',
        'TestUserEditor',
        'testusereditor',
        'editor',
        '2024-02-16 19:20:40.378687-08'
    );

INSERT INTO public.auth_user_credentials(user_id, email, email_verified, hashed_password)
VALUES (
        'RanobeBot',
        'botsdontneedemails',
        true,
        -- password is `aaaaaa`
        '$argon2id$v=19$m=19456,t=2,p=1$Y3hjNSo3SDhlcFE4UXY$J5Z3948DaabX/DnRY1mRww'
    ),
    (
        'Deleted',
        'deleted',
        true,
        -- password is `aaaaaa`
        '$argon2id$v=19$m=19456,t=2,p=1$Y3hjNSo3SDhlcFE4UXY$J5Z3948DaabX/DnRY1mRww'
    ),
    (
        '9ugxrixoqb5u64x',
        'a@a.ca',
        true,
        -- password is `aaaaaa`
        '$argon2id$v=19$m=19456,t=2,p=1$PgZdE2sVudQVXtH+THkwPg$5FI8R3occXc5fRBwRrRLiJIRctD8bnYVq6v1/JQJtQc'
    ),
    (
        'ap0mo8i0vvog6wi',
        'user@user.ca',
        true,
        -- password is `password`
        '$argon2id$v=19$m=19456,t=2,p=1$KXosrnaI50U0xiXDxyoGxA$axycEXkr/fz3OhsPJafCaAaj7I7vM1bBUPfZuRfWzvQ'
    ),
    (
        'q5tphufdf9pdlyo',
        'mod@mod.ca',
        true,
        -- password is `password`
        '$argon2id$v=19$m=19456,t=2,p=1$iAE6/OCtYYenfZKa6WBNqw$d7F6xC9YmEvjcO7i+92KzAC3GYOaRLJAVzligXNtM18'
    ),
    (
        '0opogjc1rrkdc6r',
        'editor@editor.ca',
        true,
        -- password is `password`
        '$argon2id$v=19$m=19456,t=2,p=1$e03JSJ0mZurdCzdbD369gw$vb4XzPD/kquUs3bDov0k8+/bWw141A0qumDPlP62yIo'
    );

INSERT INTO public.auth_session (id, user_id, expires_at)
VALUES (
        '2910c6232f0d1d837d5cdce18112a61dec3873102e9874aba698d39ba8eceb26',
        'q5tphufdf9pdlyo',
        '2999-03-17 20:20:35.38-07'
    ),
    (
        '522a48397aba09b428d5ca902cd774709fef85b7620f5fd4c2f1d6f147b698bf',
        '9ugxrixoqb5u64x',
        '2024-03-18 07:54:38.247-07'
    ),
    (
        'b16ca54f6cd9b0a82e11fd564970c14d465ecbcdf8589bf897aa9658b6262b7a',
        'ap0mo8i0vvog6wi',
        '2999-03-18 12:28:33.134-07'
    ),
    (
        'f0e81579046dadbe447516e9d09ee9f6aca23f5ffedcf4a8135d117ab01e0e72',
        '0opogjc1rrkdc6r',
        '2999-03-28 14:03:16.973-07'
    );

INSERT INTO public.user_list_label (user_id, id, private, "label")
VALUES ('RanobeBot', 1, false, 'Reading'),
    ('RanobeBot', 2, false, 'Finished'),
    ('RanobeBot', 3, false, 'Plan to read'),
    ('RanobeBot', 4, false, 'Stalled'),
    ('RanobeBot', 5, false, 'Dropped'),
    ('Deleted', 1, false, 'Reading'),
    ('Deleted', 2, false, 'Finished'),
    ('Deleted', 3, false, 'Plan to read'),
    ('Deleted', 4, false, 'Stalled'),
    ('Deleted', 5, false, 'Dropped'),
    ('9ugxrixoqb5u64x', 1, false, 'Reading'),
    ('9ugxrixoqb5u64x', 2, false, 'Finished'),
    ('9ugxrixoqb5u64x', 3, false, 'Plan to read'),
    ('9ugxrixoqb5u64x', 4, false, 'Stalled'),
    ('9ugxrixoqb5u64x', 5, false, 'Dropped'),
    ('ap0mo8i0vvog6wi', 1, false, 'Reading'),
    ('ap0mo8i0vvog6wi', 2, false, 'Finished'),
    ('ap0mo8i0vvog6wi', 3, false, 'Plan to read'),
    ('ap0mo8i0vvog6wi', 4, false, 'Stalled'),
    ('ap0mo8i0vvog6wi', 5, false, 'Dropped'),
    ('q5tphufdf9pdlyo', 1, false, 'Reading'),
    ('q5tphufdf9pdlyo', 2, false, 'Finished'),
    ('q5tphufdf9pdlyo', 3, false, 'Plan to read'),
    ('q5tphufdf9pdlyo', 4, false, 'Stalled'),
    ('q5tphufdf9pdlyo', 5, false, 'Dropped'),
    ('0opogjc1rrkdc6r', 1, false, 'Reading'),
    ('0opogjc1rrkdc6r', 2, false, 'Finished'),
    ('0opogjc1rrkdc6r', 3, false, 'Plan to read'),
    ('0opogjc1rrkdc6r', 4, false, 'Stalled'),
    ('0opogjc1rrkdc6r', 5, false, 'Dropped');